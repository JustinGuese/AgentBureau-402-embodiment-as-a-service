#!/bin/bash

# Configuration
RPC_URL="https://mainnet.base.org"
USDC_ADDRESS="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
PRIVATE_KEY="your_private_key_here"
API_URL="https://agentbureau-api.datafortress.cloud/v1/companies/formations"

PAYLOAD='{
    "company_name": "Autonomous Ventures GmbH",
    "company_type": "GMBH",
    "stammkapital": 12500.0,
    "founder_name": "Alice Agent",
    "founder_address": "Digital Ether 0x123",
    "description": "Building the future of agentic economy."
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
    PAYMENT_LINK=$(echo "$BODY" | jq -r '.payment_link')

    # Parse payment_link (ethereum:address@chainId/deposit?params)
    ESCROW_ADDR=$(echo "$PAYMENT_LINK" | sed -n 's/ethereum:\([^@]*\)@.*/\1/p')
    
    # Extract params from query string
    QUERY=$(echo "$PAYMENT_LINK" | cut -d'?' -f2)
    AMOUNT_RAW=$(echo "$QUERY" | sed -n 's/.*uint256=\([^&]*\).*/\1/p' | head -n 1)
    DURATION=$(echo "$QUERY" | sed -n 's/.*uint256=\([^&]*\).*/\1/p' | tail -n 1)
    PAYEE=$(echo "$QUERY" | sed -n 's/.*address=\([^&]*\).*/\1/p')
    FEE_BPS=$(echo "$QUERY" | sed -n 's/.*uint16=\([^&]*\).*/\1/p')
    MILESTONES=$(echo "$QUERY" | sed -n 's/.*uint16\[3\]=\([^&]*\).*/\1/p')
    # Milestones need to be passed as an array to cast. 
    # Milestone string is "2000,5000,3000". cast expects "[2000,5000,3000]"
    MILESTONE_ARRAY="[$MILESTONES]"
    OP_SIG=$(echo "$QUERY" | sed -n 's/.*bytes=\([^&]*\).*/\1/p')

    echo "402 Received. Intent ID: $INTENT_ID"
    echo "Escrow Address: $ESCROW_ADDR"

    # 2. Approve USDC
    echo "Approving USDC for escrow..."
    cast send $USDC_ADDRESS "approve(address,uint256)" $ESCROW_ADDR $AMOUNT_RAW \
        --rpc-url $RPC_URL \
        --private-key $PRIVATE_KEY \
        --async --json > /dev/null

    # 3. Deposit into Escrow
    echo "Depositing into Escrow..."
    TX_HASH=$(cast send $ESCROW_ADDR "deposit(bytes32,uint256,uint256,address,uint16,uint16[3],bytes)" \
        $INTENT_ID $AMOUNT_RAW $DURATION $PAYEE $FEE_BPS "$MILESTONE_ARRAY" $OP_SIG \
        --rpc-url $RPC_URL \
        --private-key $PRIVATE_KEY \
        --async --json | jq -r '.transactionHash')

    echo "Deposit tx: $TX_HASH. Waiting..."
    sleep 5

    # 4. Sign
    MESSAGE="AgentBureau Intent: $INTENT_ID"
    SIGNATURE=$(cast wallet sign "$MESSAGE" --private-key $PRIVATE_KEY)

    # 5. Retry
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
