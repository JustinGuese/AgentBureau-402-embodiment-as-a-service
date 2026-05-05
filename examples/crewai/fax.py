import os
import httpx
import uuid
from web3 import Web3
from eth_account.messages import encode_defunct
from dotenv import load_dotenv
from crewai_tools import BaseTool
from pydantic import Field

load_dotenv(dotenv_path='../.env')

# Configuration
RPC_URL = os.getenv("RPC_URL", "https://mainnet.base.org")
USDC_ADDRESS = os.getenv("USDC_ADDRESS", "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
API_BASE = os.getenv("API_BASE", "https://agentbureau-api.datafortress.cloud/v1")

w3 = Web3(Web3.HTTPProvider(RPC_URL))

class AgentBureauFaxTool(BaseTool):
    name: str = "AgentBureau Fax Tool"
    description: str = "Sends a physical fax via the AgentBureau API. Required for legally secure transmission in Germany."
    recipient: str = Field(..., description="The recipient fax number (e.g., +49...)")
    content: str = Field(..., description="The text content of the fax.")

    def _run(self, recipient: str, content: str) -> str:
        if not PRIVATE_KEY:
            return "Error: PRIVATE_KEY not found in environment."
        
        account = w3.eth.account.from_key(PRIVATE_KEY)
        url = f"{API_BASE}/fax"
        payload = {"recipient": recipient, "content": content}
        idempotency_key = str(uuid.uuid4())
        headers = {"Idempotency-Key": idempotency_key}
        
        # 1. Initial Call (Challenge)
        response = httpx.post(url, json=payload, headers=headers)
        
        if response.status_code == 402:
            data = response.json()
            intent_id = data.get("intent_id")
            
            payment_info = response.headers.get("PAYMENT-REQUIRED")
            parts = [p.strip() for p in payment_info.split(';')]
            amount_raw = int(float(parts[0]) * 1_000_000) # USDC has 6 decimals
            wallet_address = parts[3]
            
            # 2. Send USDC on Base
            usdc_abi = [{"constant":False,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"type":"function"}]
            usdc_contract = w3.eth.contract(address=USDC_ADDRESS, abi=usdc_abi)
            
            nonce = w3.eth.get_transaction_count(account.address)
            tx = usdc_contract.functions.transfer(wallet_address, amount_raw).build_transaction({
                'chainId': 8453,
                'gas': 100000,
                'gasPrice': w3.eth.gas_price,
                'nonce': nonce,
            })
            
            signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
            tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction).hex()
            
            # 3. Wait for on-chain settlement and sign the intent
            w3.eth.wait_for_transaction_receipt(tx_hash)
            
            message = encode_defunct(text=f"AgentBureau Intent: {intent_id}")
            signed_message = w3.eth.account.sign_message(message, private_key=PRIVATE_KEY)
            signature = signed_message.signature.hex()
            
            # 4. Final Settle
            retry_headers = {
                "Idempotency-Key": idempotency_key,
                "PAYMENT-SIGNATURE": tx_hash,
                "PAYMENT-AUTHORIZATION": signature
            }
            final_response = httpx.post(url, json=payload, headers=retry_headers)
            return str(final_response.json())
        
        return str(response.json())

if __name__ == "__main__":
    # Example usage with CrewAI
    from crewai import Agent, Task, Crew
    
    fax_tool = AgentBureauFaxTool()
    
    clerk = Agent(
        role='Legal Clerk',
        goal='Send a formal fax to the tax office.',
        backstory='You are an automated legal clerk specializing in German bureaucracy.',
        tools=[fax_tool],
        verbose=True
    )
    
    task = Task(
        description='Send a fax to +49123456789 with the content: "This is a formal test of the AgentBureau CrewAI integration."',
        agent=clerk,
        expected_output='JSON response from the AgentBureau API'
    )
    
    crew = Crew(agents=[clerk], tasks=[task])
    result = crew.kickoff()
    print(result)
