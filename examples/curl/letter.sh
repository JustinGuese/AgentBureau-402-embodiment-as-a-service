#!/bin/bash

# Configuration
RPC_URL="https://mainnet.base.org"
USDC_ADDRESS="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
PRIVATE_KEY="your_private_key_here"
API_URL="https://agentbureau-api.datafortress.cloud/v1/letters"

PAYLOAD='{
    "recipient_address": {
        "name": "Finanzamt Berlin",
        "street": "Musterstraße 1",
        "zip": "10115",
        "city": "Berlin",
        "country": "Germany"
    },
    "content_pdf_url": "https://example.com/letter.pdf"
}'

IDEMPOTENCY_KEY=$(uuidgen)

# 1. Initial Call (Expect 402)
RESPONSE=$(curl -s -i -X POST $API_URL \
     -H "Content-Type: application/json" \
     -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
     -d "$PAYLOAD")

HTTP_STATUS=$(echo "$RESPONSE" | grep HTTP | awk '{print $2}' | head -n 1)

if [ "$HTTP_STATUS" -eq 402 ]; then
    BODY=$(echo "$RESPONSE" | sed -n '/{/,/}/p')
    INTENT_ID=$(echo "$BODY" | jq -r '.intent_id')
    AMOUNT_USDC=$(echo "$BODY" | jq -r '.amount')
    RECEIVER=$(echo "$BODY" | jq -r '.payment_link' | sed -n 's/.*address=\([^&]*\).*/\1/p')

    AMOUNT_RAW=$(echo "$AMOUNT_USDC * 1000000 / 1" | bc)

    echo "402 Received. Intent ID: $INTENT_ID"
    echo "Payment Required: $AMOUNT_USDC USDC to $RECEIVER"

    # 2. Send USDC
    TX_HASH=$(cast send $USDC_ADDRESS "transfer(address,uint256)" $RECEIVER $AMOUNT_RAW \
        --rpc-url $RPC_URL \
        --private-key $PRIVATE_KEY \
        --async --json | jq -r '.transactionHash')

    echo "Transaction sent: $TX_HASH. Waiting for confirmation..."
    sleep 5

    # 3. Sign
    MESSAGE="AgentBureau Intent: $INTENT_ID"
    SIGNATURE=$(cast wallet sign "$MESSAGE" --private-key $PRIVATE_KEY)

    # 4. Retry
    curl -X POST $API_URL \
         -H "Content-Type: application/json" \
         -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
         -H "PAYMENT-SIGNATURE: $TX_HASH" \
         -H "PAYMENT-AUTHORIZATION: $SIGNATURE" \
         -d "$PAYLOAD"
else
    echo "Unexpected status: $HTTP_STATUS"
    echo "$RESPONSE"
fi
