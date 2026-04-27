import os
import httpx
import json
from web3 import Web3
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

def form_gmbh_payment_flow(input_str: str):
    """Initiates GmbH formation. Input should be a JSON string with 'company_name' and 'shareholders'."""
    try:
        data = json.loads(input_str)
    except json.JSONDecodeError:
        return "Error: Input must be a valid JSON string"

    url = f"{API_BASE}/companies/formations"
    
    # 1. Initial Call
    response = httpx.post(url, json=data)
    
    if response.status_code == 402:
        payment_info = response.headers.get("PAYMENT-REQUIRED")
        parts = {p.split('=')[0]: p.split('=')[1] for p in payment_info.split(';')}
        wallet_address = parts['receiver']
        amount_raw = int(parts['amount'])
        
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
        
        # 3. Wait and Retry
        w3.eth.wait_for_transaction_receipt(tx_hash)
        final_response = httpx.post(url, json=data, headers={"PAYMENT-SIGNATURE": tx_hash})
        return final_response.json()
    
    return response.json()

tools = [
    Tool(
        name="FormGmbH",
        func=form_gmbh_payment_flow,
        description="Useful for initiating German GmbH formation. Input: JSON string with company_name and shareholders array."
    )
]

if __name__ == "__main__":
    llm = ChatOpenAI(temperature=0)
    agent = initialize_agent(tools, llm, agent="zero-shot-react-description", verbose=True)
    prompt = """I want to start a company called 'Autonomous Ventures GmbH'. 
    The main shareholder is Alice Agent with 25,000 shares at 'Digital Ether 0x123'."""
    agent.run(prompt)
