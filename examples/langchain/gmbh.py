import os
import httpx
import json
import uuid
from web3 import Web3
from eth_account.messages import encode_defunct
from urllib.parse import urlparse, parse_qs
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
    idempotency_key = str(uuid.uuid4())
    headers = {"Idempotency-Key": idempotency_key}
    
    # 1. Initial Call
    response = httpx.post(url, json=data, headers=headers)
    
    if response.status_code == 402:
        resp_data = response.json()
        intent_id = resp_data.get("intent_id")
        payment_link = resp_data.get("payment_link")
        
        # Parse payment link
        parsed_link = urlparse(payment_link)
        escrow_address = parsed_link.path.split('@')[0]
        params = parse_qs(parsed_link.query)
        
        amount_raw = int(params['uint256'][0])
        duration = int(params['uint256'][1])
        payee = params['address'][0]
        fee_bps = int(params['uint16'][0])
        milestones = [int(m) for m in params['uint16[3]'][0].split(',')]
        operator_signature = params['bytes'][0]

        # 2. Approve USDC
        usdc_abi = [{"constant":False,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"type":"function"}]
        usdc_contract = w3.eth.contract(address=USDC_ADDRESS, abi=usdc_abi)
        
        approve_tx = usdc_contract.functions.approve(escrow_address, amount_raw).build_transaction({
            'chainId': 8453,
            'gas': 100000,
            'gasPrice': w3.eth.gas_price,
            'nonce': w3.eth.get_transaction_count(account.address),
        })
        signed_approve = w3.eth.account.sign_transaction(approve_tx, PRIVATE_KEY)
        w3.eth.send_raw_transaction(signed_approve.raw_transaction)

        # 3. Escrow Deposit
        escrow_abi = [{"inputs":[{"internalType":"bytes32","name":"intentId","type":"bytes32"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"duration","type":"uint256"},{"internalType":"address","name":"payee","type":"address"},{"internalType":"uint16","name":"feeBps","type":"uint16"},{"internalType":"uint16[3]","name":"milestoneWeights","type":"uint16[3]"},{"internalType":"bytes","name":"operatorSignature","type":"bytes"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"}]
        escrow_contract = w3.eth.contract(address=escrow_address, abi=escrow_abi)
        
        deposit_tx = escrow_contract.functions.deposit(
            intent_id,
            amount_raw,
            duration,
            payee,
            fee_bps,
            milestones,
            operator_signature
        ).build_transaction({
            'chainId': 8453,
            'gas': 300000,
            'gasPrice': w3.eth.gas_price,
            'nonce': w3.eth.get_transaction_count(account.address),
        })
        
        signed_deposit = w3.eth.account.sign_transaction(deposit_tx, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_deposit.raw_transaction).hex()
        
        w3.eth.wait_for_transaction_receipt(tx_hash)

        # 4. Sign the Intent ID for Authorization
        message = encode_defunct(text=f"AgentBureau Intent: {intent_id}")
        signed_message = w3.eth.account.sign_message(message, private_key=PRIVATE_KEY)
        signature = signed_message.signature.hex()
        
        # 5. Retry with payment signature and authorization
        retry_headers = {
            "Idempotency-Key": idempotency_key,
            "PAYMENT-SIGNATURE": tx_hash,
            "PAYMENT-AUTHORIZATION": signature
        }
        final_response = httpx.post(url, json=data, headers=retry_headers)
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
