import os
import httpx
import json
import anthropic
import uuid
from web3 import Web3
from eth_account.messages import encode_defunct
from dotenv import load_dotenv

load_dotenv(dotenv_path='../.env')

# Configuration
RPC_URL = os.getenv("RPC_URL", "https://mainnet.base.org")
USDC_ADDRESS = os.getenv("USDC_ADDRESS", "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
API_BASE = os.getenv("API_BASE", "https://agentbureau-api.datafortress.cloud/v1")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

w3 = Web3(Web3.HTTPProvider(RPC_URL))
account = w3.eth.account.from_key(PRIVATE_KEY) if PRIVATE_KEY else None
client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

def send_fax_tool(recipient, content):
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

def run_claude_agent():
    tools = [
        {
            "name": "send_fax",
            "description": "Sends a digital fax via AgentBureau.",
            "input_schema": {
                "type": "object",
                "properties": {
                    "recipient": {"type": "string", "description": "The recipient's fax number (e.g., +49...)"},
                    "content": {"type": "string", "description": "The text content of the fax"}
                },
                "required": ["recipient", "content"]
            }
        }
    ]

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        tools=tools,
        messages=[{"role": "user", "content": "Send a fax to +49123456789 with the message: 'Hello Claude, please send this fax!'"}]
    )

    if response.stop_reason == "tool_use":
        tool_use = response.content[-1]
        if tool_use.name == "send_fax":
            result = send_fax_tool(**tool_use.input)
            
            # Send result back to Claude
            final_response = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=1024,
                tools=tools,
                messages=[
                    {"role": "user", "content": "Send a fax to +49123456789 with the message: 'Hello Claude, please send this fax!'"},
                    {"role": "assistant", "content": response.content},
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "tool_result",
                                "tool_use_id": tool_use.id,
                                "content": json.dumps(result),
                            }
                        ],
                    },
                ]
            )
            print(final_response.content[0].text)

if __name__ == "__main__":
    run_claude_agent()
