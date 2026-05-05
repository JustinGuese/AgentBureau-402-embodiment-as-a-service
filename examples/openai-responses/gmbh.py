import os
import httpx
import json
import uuid
from openai import OpenAI
from web3 import Web3
from eth_account.messages import encode_defunct
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv

load_dotenv(dotenv_path='../.env')

# Configuration
RPC_URL = os.getenv("RPC_URL", "https://mainnet.base.org")
USDC_ADDRESS = os.getenv("USDC_ADDRESS", "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
API_BASE = os.getenv("API_BASE", "https://agentbureau-api.datafortress.cloud/v1")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

w3 = Web3(Web3.HTTPProvider(RPC_URL))
account = w3.eth.account.from_key(PRIVATE_KEY) if PRIVATE_KEY else None
client = OpenAI(api_key=OPENAI_API_KEY)

def form_gmbh_tool(company_name, shareholders):
    url = f"{API_BASE}/companies/formations"
    payload = {"company_name": company_name, "shareholders": shareholders}
    idempotency_key = str(uuid.uuid4())
    headers = {"Idempotency-Key": idempotency_key}
    
    # 1. Initial Call
    response = httpx.post(url, json=payload, headers=headers)
    
    if response.status_code == 402:
        data = response.json()
        intent_id = data.get("intent_id")
        payment_link = data.get("payment_link")
        
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
        final_response = httpx.post(url, json=payload, headers=retry_headers)
        return final_response.json()
    
    return response.json()

def run_openai_agent():
    tools = [
        {
            "type": "function",
            "function": {
                "name": "form_gmbh",
                "description": "Initiates German GmbH formation process.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "company_name": {"type": "string"},
                        "shareholders": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "name": {"type": "string"},
                                    "shares": {"type": "number"},
                                    "address": {"type": "string"}
                                },
                                "required": ["name", "shares", "address"]
                            }
                        }
                    },
                    "required": ["company_name", "shareholders"]
                }
            }
        }
    ]

    prompt = "I want to start a company called 'Autonomous Ventures GmbH'. The main shareholder is Alice Agent with 25,000 shares at 'Digital Ether 0x123'."
    messages = [{"role": "user", "content": prompt}]
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=tools,
        tool_choice="auto"
    )

    response_message = response.choices[0].message
    tool_calls = response_message.tool_calls

    if tool_calls:
        messages.append(response_message)
        for tool_call in tool_calls:
            if tool_call.function.name == "form_gmbh":
                function_args = json.loads(tool_call.function.arguments)
                print(f"Executing form_gmbh with args: {function_args}")
                result = form_gmbh_tool(**function_args)
                
                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": "form_gmbh",
                    "content": json.dumps(result),
                })
        
        final_response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
        )
        print(final_response.choices[0].message.content)

if __name__ == "__main__":
    run_openai_agent()
