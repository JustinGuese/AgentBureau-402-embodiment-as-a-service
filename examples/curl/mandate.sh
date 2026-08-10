#!/bin/bash
#
# Create a spend mandate and watch it refuse an over-budget call.
#
# Unlike the other scripts here this one needs NO USDC and sends NO transaction:
# a mandate is a signature, and an over-budget call is refused before any payment is
# requested. Runs fine on an empty wallet.
#
# Requires: foundry (cast), jq
# Docs: https://agentbureau.de/docs/for-agents/spend-mandates

set -euo pipefail

PRIVATE_KEY="${PRIVATE_KEY:-your_private_key_here}"
API_BASE="${API_BASE:-https://agentbureau-api.datafortress.cloud/v1}"
# The mount decides the chain, and it is part of the signed document, so a testnet
# mandate can never authorize mainnet spend.
if [ -z "${CHAIN:-}" ]; then
  case "$API_BASE" in *"/dev/"*) CHAIN="testnet" ;; *) CHAIN="mainnet" ;; esac
fi

ADDRESS=$(cast wallet address --private-key "$PRIVATE_KEY" | tr '[:upper:]' '[:lower:]')

# --- The mandate ----------------------------------------------------------------
PER_CALL="2.000000"      # a single call may never cost more than this
DAILY="10.000000"        # UTC calendar day
MONTHLY="*"              # "*" means unlimited
TOTAL="*"
# Comma-separated, sorted, no trailing slashes. Empty string = every priced endpoint.
# Inkasso is left out so the scope check has something to refuse.
PATHS="/v1/fax,/v1/invoices,/v1/letters"
NONCE=$(uuidgen | tr -d '-')
NOT_BEFORE=$(date -u +"%Y-%m-%dT%H:%M:%S")
EXPIRES_AT=$(date -u -d "+30 days" +"%Y-%m-%dT%H:%M:%S")

# The canonical seed. The server rebuilds this exact string from the JSON below and
# recovers the signer against its hash — any difference in ordering, casing or number
# formatting comes back as a 403.
SEED="${CHAIN}:${ADDRESS}:${ADDRESS}:${PER_CALL}:${DAILY}:${MONTHLY}:${TOTAL}:${PATHS}:${NOT_BEFORE}:${EXPIRES_AT}:${NONCE}"
MANDATE_ID=$(cast keccak "$SEED")
SIGNATURE=$(cast wallet sign "AgentBureau Mandate: $MANDATE_ID" --private-key "$PRIVATE_KEY")

echo "Wallet: $ADDRESS"
echo "Computed mandate_id: $MANDATE_ID"

# 1. Create it. Free — no 402, no payment.
BODY=$(jq -n \
  --arg addr "$ADDRESS" --arg chain "$CHAIN" --arg nonce "$NONCE" \
  --arg nb "$NOT_BEFORE" --arg exp "$EXPIRES_AT" --arg sig "$SIGNATURE" \
  --argjson per_call 2.0 --argjson daily 10.0 \
  --argjson paths "$(echo "$PATHS" | jq -R 'split(",")')" \
  '{controller_address:$addr, spender_address:$addr, chain:$chain,
    per_call_cap_usdc:$per_call, daily_cap_usdc:$daily,
    monthly_cap_usdc:null, total_cap_usdc:null,
    allowed_paths:$paths, nonce:$nonce,
    not_before:$nb, expires_at:$exp, controller_signature:$sig}')

CREATED=$(curl -s -X POST "$API_BASE/mandates" -H "Content-Type: application/json" -d "$BODY")
if [ "$(echo "$CREATED" | jq -r '.mandate_id // "null"')" = "null" ]; then
  echo "Create failed: $CREATED"; exit 1
fi
echo "Created. Server agrees on id: $([ "$(echo "$CREATED" | jq -r .mandate_id)" = "$MANDATE_ID" ] && echo true || echo false)"
echo

# Helper: POST with the mandate header, print status + denial reason.
call() {
  local label="$1" path="$2" payload="$3"
  local out status reason
  out=$(curl -s -o /tmp/ab_body.json -D /tmp/ab_head.txt -w "%{http_code}" \
    -X POST "$API_BASE$path" -H "Content-Type: application/json" \
    -H "X-MANDATE-ID: $MANDATE_ID" -d "$payload")
  status="$out"
  reason=$(grep -i '^x-policy-denied:' /tmp/ab_head.txt | tr -d '\r' | cut -d' ' -f2- || true)
  if [ "$status" = "402" ]; then
    echo "$label -> 402 payment requested, as normal"
  else
    echo "$label -> $status X-POLICY-DENIED: ${reason:-none}"
    jq -r 'if .cap_usdc then "  attempted \(.attempted_usdc) USDC against a cap of \(.cap_usdc) USDC" else empty end' /tmp/ab_body.json
  fi
}

# 2. Fax costs 1.00 USDC — under the 2.00 per-call cap, so the normal 402 arrives.
call "POST /fax      (1.00 USDC)" "/fax" \
  '{"recipient_number":"+49123456789","content":"Within budget."}'

# 3. Invoice costs 5.00 USDC — over the cap. 403, and no payment was ever requested.
call "POST /invoices (5.00 USDC)" "/invoices" \
  '{"recipient_name":"Acme GmbH","recipient_email":"billing@acme.de","amount":100.0,"description":"Consulting"}'

# 4. Outside the allowlist: refused regardless of price.
call "POST /legal/inkasso       " "/legal/inkasso" \
  '{"debtor_name":"Late Payer Ltd","debtor_address":"Shady Lane 4, London","amount":1500,"invoice_pdf_uri":"https://example.com/unpaid.pdf","dunning_history":[]}'

# 5. Remaining budget, any time, for free.
echo
curl -s "$API_BASE/mandates/$MANDATE_ID/status" \
  | jq -r '"Budget: \(.spent_today_usdc) spent today, \(.remaining_today_usdc) remaining, resets \(.daily_reset_at)"'
