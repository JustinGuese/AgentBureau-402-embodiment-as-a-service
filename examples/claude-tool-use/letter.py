import os
import httpx
import json
import anthropic
from web3 import Web3
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

def send_letter_tool(recipient_address, content_pdf_url):
    url = f"{API_BASE}/letters"
    payload = {"recipient_address": recipient_address, "content_pdf_url": content_pdf_url}
    
    # 1. Initial Call
    response = httpx.post(url, json=payload)
    
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
        final_response = httpx.post(url, json=payload, headers={"PAYMENT-SIGNATURE": tx_hash})
        return final_response.json()
    
    return response.json()

def run_claude_agent():
    tools = [
        {
            "name": "send_letter",
            "description": "Sends a physical letter via AgentBureau.",
            "input_schema": {
                "type": "object",
                "properties": {
                    "recipient_address": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "street": {"type": "string"},
                            "zip": {"type": "string"},
                            "city": {"type": "string"},
                            "country": {"type": "string"}
                        },
                        "required": ["name", "street", "zip", "city", "country"]
                    },
                    "content_pdf_url": {"type": "string", "description": "URL to the PDF content"}
                },
                "required": ["recipient_address", "content_pdf_url"]
            }
        }
    ]

    prompt = "Send a letter to Finanzamt Berlin, Musterstraße 1, 10115 Berlin, Germany. The content is at https://example.com/letter.pdf"

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        tools=tools,
        messages=[{"role": "user", "content": prompt}]
    )

    if response.stop_reason == "tool_use":
        tool_use = response.content[-1]
        if tool_use.name == "send_letter":
            result = send_letter_tool(**tool_use.input)
            
            # Send result back to Claude
            final_response = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=1024,
                tools=tools,
                messages=[
                    {"role": "user", "content": prompt},
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
