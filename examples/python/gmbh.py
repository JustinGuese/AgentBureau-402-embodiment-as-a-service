import os
import httpx
import uuid
from web3 import Web3
from eth_account.messages import encode_defunct
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv

load_dotenv()

# Configuration
RPC_URL = os.getenv("RPC_URL", "https://mainnet.base.org")
USDC_ADDRESS = os.getenv("USDC_ADDRESS", "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913")
PRIVATE_KEY = os.getenv("PRIVATE_KEY", "your_private_key_here")
API_BASE = os.getenv("API_BASE", "https://agentbureau-api.datafortress.cloud/v1")
SERVICE_ENDPOINT = f"{API_BASE}/companies/formations"

w3 = Web3(Web3.HTTPProvider(RPC_URL))
account = w3.eth.account.from_key(PRIVATE_KEY)

# Payload for GmbH Formation
payload = {
    "company_name": "Autonomous Ventures GmbH",
    "company_type": "GMBH",
    "stammkapital": 12500.0,
    "founder_name": "Alice Agent",
    "founder_address": "Digital Ether 0x123",
    "description": "Building the future of agentic economy."
}

def run_flow():
    idempotency_key = str(uuid.uuid4())
    print(f"Calling {SERVICE_ENDPOINT} with Idempotency-Key: {idempotency_key}...")
    
    # 1. Initial Call (Expect 402)
    headers = {"Idempotency-Key": idempotency_key}
    try:
        response = httpx.post(SERVICE_ENDPOINT, json=payload, headers=headers)
    except Exception as e:
        print(f"Error connecting to API: {e}")
        return

    if response.status_code == 402:
        # Extract details
        data = response.json()
        intent_id = data.get("intent_id")
        payment_link = data.get("payment_link")
        
        print(f"402 Received. Intent ID: {intent_id}")
        
        # Parse payment link for escrow deposit arguments
        # ethereum:<address>@<chain_id>/deposit?bytes32=<intent_id>&uint256=<amount>&uint256=<duration>&address=<payee>&uint16=<feeBps>&uint16[3]=<milestones>&bytes=<sig>
        parsed_link = urlparse(payment_link)
        escrow_address = parsed_link.path.split('@')[0]
        params = parse_qs(parsed_link.query)
        
        amount_raw = int(params['uint256'][0])
        duration = int(params['uint256'][1])
        payee = params['address'][0]
        fee_bps = int(params['uint16'][0])
        milestones = [int(m) for m in params['uint16[3]'][0].split(',')]
        operator_signature = params['bytes'][0]

        print(f"Depositing {amount_raw / 1e6} USDC into Escrow at {escrow_address}...")

        # 2. Approve USDC for Escrow
        usdc_abi = [{"constant":False,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"type":"function"},
                    {"constant":False,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"type":"function"}]
        usdc_contract = w3.eth.contract(address=USDC_ADDRESS, abi=usdc_abi)
        
        # Approve
        approve_tx = usdc_contract.functions.approve(escrow_address, amount_raw).build_transaction({
            'chainId': 8453,
            'gas': 100000,
            'gasPrice': w3.eth.gas_price,
            'nonce': w3.eth.get_transaction_count(account.address),
        })
        signed_approve = w3.eth.account.sign_transaction(approve_tx, PRIVATE_KEY)
        w3.eth.send_raw_transaction(signed_approve.raw_transaction)
        print("USDC Approval sent.")

        # 3. Send Escrow Deposit
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
        
        print(f"Deposit transaction sent: {tx_hash}. Waiting for confirmation...")
        w3.eth.wait_for_transaction_receipt(tx_hash)

        # 4. Sign the Intent ID for Authorization
        print("Signing intent for authorization...")
        message = encode_defunct(text=f"AgentBureau Intent: {intent_id}")
        signed_message = w3.eth.account.sign_message(message, private_key=PRIVATE_KEY)
        signature = signed_message.signature.hex()
        
        # 5. Retry with payment signature and authorization
        print("Retrying with payment signature and authorization...")
        retry_headers = {
            "Idempotency-Key": idempotency_key,
            "PAYMENT-SIGNATURE": tx_hash,
            "PAYMENT-AUTHORIZATION": signature
        }
        final_response = httpx.post(SERVICE_ENDPOINT, json=payload, headers=retry_headers)
        
        if final_response.status_code == 200:
            print("Success!")
            print(final_response.json())
        else:
            print(f"Final call failed with status {final_response.status_code}")
            print(final_response.text)
    else:
        print(f"Status: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    run_flow()
