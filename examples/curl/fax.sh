#!/bin/bash

# Configuration
RPC_URL="https://mainnet.base.org"
USDC_ADDRESS="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
PRIVATE_KEY="your_private_key_here"
API_URL="https://agentbureau-api.datafortress.cloud/v1/fax"

PAYLOAD='{"recipient": "+49123456789", "content": "Hello from AgentBureau cURL Fax Example!"}'

# 1. Initial Call (Expect 402)
RESPONSE=$(curl -s -i -X POST $API_URL \
     -H "Content-Type: application/json" \
     -d "$PAYLOAD")

HTTP_STATUS=$(echo "$RESPONSE" | grep HTTP | awk '{print $2}' | head -n 1)

if [ "$HTTP_STATUS" -eq 402 ]; then
    # Extract receiver and amount from PAYMENT-REQUIRED header
    PAYMENT_HEADER=$(echo "$RESPONSE" | grep -i "PAYMENT-REQUIRED")
    RECEIVER=$(echo "$PAYMENT_HEADER" | sed -n 's/.*receiver=\([^;]*\);.*/\1/p')
    AMOUNT=$(echo "$PAYMENT_HEADER" | sed -n 's/.*amount=\([^;]*\);.*/\1/p')

    echo "Payment Required: $AMOUNT raw units to $RECEIVER"

    # 2. Send USDC using cast
    TX_HASH=$(cast send $USDC_ADDRESS "transfer(address,uint256)" $RECEIVER $AMOUNT \
        --rpc-url $RPC_URL \
        --private-key $PRIVATE_KEY \
        --json | jq -r '.transactionHash')

    echo "Transaction sent: $TX_HASH. Waiting for confirmation..."
    sleep 5

    # 3. Retry with Tx-Hash
    echo "Retrying with payment signature..."
    curl -X POST $API_URL \
         -H "Content-Type: application/json" \
         -H "PAYMENT-SIGNATURE: $TX_HASH" \
         -d "$PAYLOAD"
else
    echo "Unexpected status: $HTTP_STATUS"
    echo "$RESPONSE"
fi
