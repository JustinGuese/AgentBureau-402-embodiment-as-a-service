---
title: Prepaid Credits
description: How one x402 top-up funds a wallet-keyed balance that metered endpoints debit per unit of work.
---

Most AgentBureau endpoints are single-shot: one 402, one payment, one action. That works because the price is known before the call — a fax is 1.00 USDC whether it is one page or three.

Metered endpoints break both halves of that assumption. The cost of an LLM completion is not knowable until it has run, and the settlement itself is uneconomic at that size: a USDC transfer on Base costs roughly $0.005 in gas and takes a confirmation to clear, which is more time and more money than a $0.002 completion is worth. Paying per call would mean the payment costs more than the thing it buys.

Prepaid credits solve both. You pay once, in the ordinary x402 way, and draw the balance down per unit of work.

## Which endpoints are metered

Today: `/v1/inference/*` only.

**Every other endpoint stays single-shot x402.** Faxes, letters, invoices, formations, VAT filings and Vollmachten are unchanged — they are priced per act, and per-act payment is the right model for them. Credits are an addition for work whose cost is variable, not a migration path for the rest of the API.

## The flow

1. **Top up.** `POST /v1/inference/credits` with an amount and a unique nonce.
2. **Get a 402.** Identical in shape to every other AgentBureau 402 — same `PAYMENT-REQUIRED` header, same `payment_link`, same `intent_id`.
3. **Pay.** Standard USDC `transfer()` on Base.
4. **Retry with proof.** `PAYMENT-SIGNATURE` (tx hash) and `PAYMENT-AUTHORIZATION` (your signature over `AgentBureau Intent: {intent_id}`).
5. **Receive a credit key.** The 200 response carries `credit_key` and your new balance.
6. **Spend.** Send the key as `Authorization: Bearer <credit_key>` on metered calls. Each one debits actual usage.

```bash
curl -X POST https://agentbureau-api.datafortress.cloud/v1/inference/credits \
     -H "Content-Type: application/json" \
     -d '{"amount_usdc": 10.0, "nonce": "'"$(uuidgen)"'"}'
# 402 → pay → retry with PAYMENT-SIGNATURE + PAYMENT-AUTHORIZATION
# 200 {"status":"credited","balance_usdc":"10.000000","credit_key":"ab_sk_..."}
```

### Why the nonce is required

Intent IDs are derived from the request body when no `Idempotency-Key` is present. For an invoice that is exactly right: sending the same invoice twice *should* collapse onto one intent. For a top-up it is exactly wrong — "add 10 USDC again" is a legitimately repeatable request, and without a distinguishing `nonce` the second one would collide with the first. Send a fresh nonce (or a fresh `Idempotency-Key`) for every top-up.

## The credit key is not an account

There is no signup, no email, no dashboard and no approval step. Any wallet mints a key for free by signing a message at `POST /v1/inference/session`; a top-up simply hands you one so you do not need a second round trip.

Treat it as a **payment receipt handle**, not a credential:

- It expires (24 hours by default) and can be revoked.
- It is worthless without a balance.
- It is stored only as a hash — a database leak yields nothing usable.
- It is scoped to one chain: a testnet key cannot spend a mainnet balance.

If you would rather hold no bearer token at all, sign each request instead and send `X-INFERENCE-AUTH`. That envelope is bound to your exact request body and carries a single-use nonce, so a captured signature cannot be replayed or re-pointed at a longer, costlier prompt.

## Checking your balance

```bash
curl https://agentbureau-api.datafortress.cloud/v1/inference/credits/<wallet_address>
```

Free, unauthenticated, and public by design — the address is already visible on-chain as the payer, so this exposes nothing a block explorer does not.

```json
{
  "balance_usdc": "9.831500",
  "reserved_usdc": "0.000000",
  "lifetime_topup_usdc": "10.000000",
  "lifetime_spend_usdc": "0.168500"
}
```

## How a call is debited

Before the work runs, a **hold** is placed for the worst-case cost — the maximum tokens the request could produce. Once the real usage is known, the actual cost is charged and the remainder returns to your balance immediately.

That is why `reserved_usdc` exists, and why a request can be refused even when your balance looks sufficient: the ceiling, not the expected cost, is what must be covered. A failed or errored request never charges you — the hold is released in full.

## Running out mid-loop

When a metered call cannot be covered, you get a **402** — not a 401, and not a 500. It carries everything needed to recover:

```json
{
  "error": "insufficient_credits",
  "credit_balance_usdc": "0.000420",
  "credit_required_usdc": "0.012000",
  "credit_topup_path": "/v1/inference/credits"
}
```

Plus `X-CREDIT-BALANCE-USDC` and `X-CREDIT-TOPUP-PATH` headers. The auto-refill pattern is straightforward:

```python
def call_with_autorefill(payload, credit_key):
    response = post("/v1/inference/chat/completions", payload, credit_key)
    if response.status_code == 402:
        top_up(amount_usdc=10.0)      # pay the 402 as usual
        response = post("/v1/inference/chat/completions", payload, credit_key)
    return response
```

Because the 402 keeps the standard `PAYMENT-REQUIRED` shape, an existing x402 client can parse it without changes — it just needs to retry against `credit_topup_path` rather than the original URL.

## Expiry, refunds, transferability

- **Credits do not expire.** The *key* expires; the balance is attached to the wallet, so minting a new key restores access.
- **Credits are non-transferable.** They are keyed to the paying wallet address.
- **No cash refunds.** Credits buy metered work and nothing else. Top up in amounts you expect to use; the minimum is 1 USDC precisely so you are not forced to over-commit.

## Testnet

Everything above works identically under `/dev` on Base Sepolia, with testnet USDC. Metered work there is served from a canned response rather than a real upstream — worthless testnet USDC must not buy real capacity — so use it to exercise the protocol, not to evaluate output quality.

## See also

- [EU-Resident Inference](/docs/services/eu-inference) — the first metered service
- [x402 Protocol](/docs/for-agents/x402-protocol) — the single-shot flow everything else uses
- [Replay Protection](/docs/for-agents/replay-protection)
