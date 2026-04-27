import os
import httpx
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

# Configuration
RPC_URL = os.getenv("RPC_URL", "https://mainnet.base.org")
USDC_ADDRESS = os.getenv("USDC_ADDRESS", "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913")
PRIVATE_KEY = os.getenv("PRIVATE_KEY", "your_private_key_here")
API_BASE = os.getenv("API_BASE", "https://agentbureau-api.datafortress.cloud/v1")
SERVICE_ENDPOINT = f"{API_BASE}/letters"

w3 = Web3(Web3.HTTPProvider(RPC_URL))
account = w3.eth.account.from_key(PRIVATE_KEY)

# Payload for Letter
payload = {
    "recipient_address": {
        "name": "Finanzamt Berlin",
        "street": "Musterstraße 1",
        "zip": "10115",
        "city": "Berlin",
        "country": "Germany"
    },
    "content_pdf_url": "https://example.com/letter.pdf"
}

def run_flow():
    # 1. Initial Call (Expect 402)
    print(f"Calling {SERVICE_ENDPOINT}...")
    try:
        response = httpx.post(SERVICE_ENDPOINT, json=payload)
    except Exception as e:
        print(f"Error connecting to API: {e}")
        return

    if response.status_code == 402:
        # Extract details
        payment_info = response.headers.get("PAYMENT-REQUIRED")
        if not payment_info:
            print("Error: 402 received but no PAYMENT-REQUIRED header found.")
            return
            
        parts = {p.split('=')[0]: p.split('=')[1] for p in payment_info.split(';')}
        wallet_address = parts['receiver']
        amount_raw = int(parts['amount'])
        
        print(f"Payment Required: {amount_raw} raw units to {wallet_address}")

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
        
        print(f"Transaction sent: {tx_hash}. Waiting for confirmation...")
        w3.eth.wait_for_transaction_receipt(tx_hash)
        
        # 3. Retry with Tx-Hash
        print("Retrying with payment signature...")
        final_response = httpx.post(
            SERVICE_ENDPOINT, 
            json=payload, 
            headers={"PAYMENT-SIGNATURE": tx_hash}
        )
        
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
