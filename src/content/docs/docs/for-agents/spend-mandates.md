---
title: Spend Mandates
description: Cap what an agent may spend per call, per day, per month and in total — enforced before the 402 is issued.
---

A **spend mandate** is a signed, scope-limited, expiring authorization for one wallet. It is the x402-native equivalent of an AP2 mandate: it answers *which actor*, *what scope*, *what limits* and *under what conditions*, and it is bound by an EIP-191 signature.

Creating, reading, revoking and auditing a mandate is **free** and requires no account — the signature is the authorization, exactly as the x402 payment is the authentication everywhere else in this API.

## Why

A funded agent wallet has one limit: its balance. A retry loop, a prompt injection, or a mis-parsed instruction can turn that into a 15,500 USDC company formation, and on-chain settlement is final. A mandate puts a ceiling and a scope between the agent's intent and the payment challenge.

## Create one

```http
POST /v1/mandates
Content-Type: application/json
```

```json
{
  "controller_address": "0xA11ce…",
  "spender_address": "0xA11ce…",
  "per_call_cap_usdc": 5.0,
  "daily_cap_usdc": 25.0,
  "monthly_cap_usdc": 200.0,
  "total_cap_usdc": null,
  "allowed_paths": ["/v1/fax", "/v1/letters", "/v1/invoices"],
  "nonce": "7c1e9b04…",
  "not_before": "2026-08-10T09:00:00",
  "expires_at": "2026-09-09T09:00:00",
  "controller_signature": "0x…"
}
```

Any cap left `null` is unlimited. An empty `allowed_paths` permits every priced endpoint.

### The signature

The `mandate_id` is `keccak256` of a canonical seed, and the controller signs a plain-text message containing it:

```
seed    = "{chain}:{controller}:{spender}:{per_call}:{daily}:{monthly}:{total}:{paths_csv}:{not_before}:{expires_at}:{nonce}"
message = "AgentBureau Mandate: {mandate_id}"
```

- Caps render as `"*"` when unlimited, otherwise with six decimals (`"5.000000"`).
- `paths_csv` is the allowlist, trailing slashes stripped, sorted, comma-joined.
- Timestamps are naive UTC to second precision (`2026-08-10T09:00:00`).
- Addresses are lowercased.
- `chain` is decided by the **mount** you POST to (`/v1/…` = mainnet, `/dev/v1/…` = testnet), not by the request body. A testnet mandate can never authorize mainnet spend.

The server recomputes the id from your fields and recovers the signer. A mismatch anywhere in the seed surfaces as `403 controller_signature does not recover to controller_address`.

Re-POSTing an identical mandate is idempotent and returns `"created": false`.

### Delegation

When `spender_address` differs from `controller_address`, the request must also carry `spender_signature` over the **same** message. Without it the request is rejected — otherwise anyone could name a stranger's wallet as spender and read its spend totals and ledger.

## Use it

Send the id on every priced call:

```bash
curl -X POST https://agentbureau-api.datafortress.cloud/v1/invoices \
  -H "X-MANDATE-ID: 0x5881…" \
  -H "Content-Type: application/json" \
  -d '{"recipient_name":"…","recipient_email":"…","amount":100,"description":"…"}'
```

If the call fits the mandate you get the normal `402` challenge and pay as usual. If it would breach a cap you get `403` with an `X-POLICY-DENIED` header — **before** any payment challenge exists, so nothing is spent. See [Policy Denied](/docs/reference/policy-denied) for the response shape.

:::caution
Without the header, the gateway cannot know which wallet is calling until the payment is verified. Caps are still enforced at that point, but the funds have already moved — the call is refused and the payment is queued for refund. Always send the header.
:::

## Check the remaining budget

```http
GET /v1/mandates/{mandate_id}/status
```

```json
{
  "spent_today_usdc": 9.0,
  "spent_month_usdc": 41.0,
  "spent_total_usdc": 41.0,
  "remaining_today_usdc": 16.0,
  "remaining_month_usdc": 159.0,
  "calls": 12,
  "active": true,
  "daily_reset_at": "2026-08-11T00:00:00"
}
```

Windows are the **UTC calendar day and calendar month**, not rolling — a daily cap resets at 00:00 UTC.

This endpoint is also exposed over MCP as the read-only tool **`check_spend_budget`**, so an agent can consult its own budget mid-run without leaving the protocol.

## Revoke

```http
POST /v1/mandates/{mandate_id}/revoke
{ "signature": "0x…" }   // over "AgentBureau Mandate Revoke: {mandate_id}"
```

Either the controller or the spender may revoke. The next call under the mandate is denied.

## Export the ledger

```http
GET /v1/mandates/{mandate_id}/audit?format=csv&deadline={unix}&signature=0x…
```

Signed by the **spender** wallet over `AgentBureau Mandate Audit: {mandate_id}:{deadline}`, with the deadline at most one hour in the future — the same deadline-bound signature pattern the arbiter endpoints use.

Each row carries the task id, timestamp, service type, `amount_usdc`, status, on-chain transaction hash, intent id and chain. Request payloads are **never** included, so customer PII stays out of the audit path.

## Limits

- Caps apply to calls made from the moment mandates shipped; calls recorded before then carry no amount and are excluded from the sums.
- A mandate governs spend **on AgentBureau**. It cannot restrict what the wallet does elsewhere on Base.
- AgentBureau implements the AP2 mandate model on the x402 rail. It does **not** yet accept AP2 mandates issued on card or bank rails.
