import os
import httpx
import uuid
from web3 import Web3
from eth_account.messages import encode_defunct
from dotenv import load_dotenv
from langchain.agents import initialize_agent, Tool
from langchain_openai import ChatOpenAI

load_dotenv(dotenv_path='../.env')

# Configuration
RPC_URL = os.getenv("RPC_URL", "https://mainnet.base.org")
USDC_ADDRESS = os.getenv("USDC_ADDRESS", "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
API_BASE = os.getenv("API_BASE", "https://agentbureau-api.datafortress.cloud/v1")

w3 = Web3(Web3.HTTPProvider(RPC_URL))
account = w3.eth.account.from_key(PRIVATE_KEY) if PRIVATE_KEY else None

def send_fax_payment_flow(input_str: str):
    """Sends a fax. Input should be 'recipient,content'."""
    try:
        recipient, content = [s.strip() for s in input_str.split(',', 1)]
    except ValueError:
        return "Error: Input must be 'recipient,content'"

    url = f"{API_BASE}/fax"
    payload = {"recipient": recipient, "content": content}
    idempotency_key = str(uuid.uuid4())
    headers = {"Idempotency-Key": idempotency_key}
    
    # 1. Initial Call
    response = httpx.post(url, json=payload, headers=headers)
    
    if response.status_code == 402:
        data = response.json()
        intent_id = data.get("intent_id")
        
        payment_info = response.headers.get("PAYMENT-REQUIRED")
        parts = [p.strip() for p in payment_info.split(';')]
        amount_raw = int(float(parts[0]) * 1_000_000)
        wallet_address = parts[3]
        
        # 2. Send USDC
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
        
        # 3. Wait and Sign
        w3.eth.wait_for_transaction_receipt(tx_hash)
        
        message = encode_defunct(text=f"AgentBureau Intent: {intent_id}")
        signed_message = w3.eth.account.sign_message(message, private_key=PRIVATE_KEY)
        signature = signed_message.signature.hex()
        
        # 4. Retry with payment signature and authorization
        retry_headers = {
            "Idempotency-Key": idempotency_key,
            "PAYMENT-SIGNATURE": tx_hash,
            "PAYMENT-AUTHORIZATION": signature
        }
        final_response = httpx.post(url, json=payload, headers=retry_headers)
        return final_response.json()
    
    return response.json()

tools = [
    Tool(
        name="SendFax",
        func=send_fax_payment_flow,
        description="Useful for sending physical faxes. Input: 'recipient,content'"
    )
]

if __name__ == "__main__":
    llm = ChatOpenAI(temperature=0)
    agent = initialize_agent(tools, llm, agent="zero-shot-react-description", verbose=True)
    agent.run("Send a fax to +49123456789 saying 'Hello from LangChain Agent!'")
