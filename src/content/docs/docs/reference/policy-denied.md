---
title: Policy Denied (403)
description: The response shape when a spend mandate refuses a call, every X-POLICY-DENIED reason, and the refund path.
---

When a [spend mandate](/docs/for-agents/spend-mandates) refuses a call, the gateway answers `403 Forbidden` with an `X-POLICY-DENIED` header. This is a distinct outcome from `402 Payment Required` — a `403` means **no payment challenge was issued** and the call cannot be retried by paying.

## Response

```http
HTTP/1.1 403 Forbidden
X-POLICY-DENIED: per_call_cap_exceeded
Content-Type: application/json
```

```json
{
  "detail": "Spend mandate denied this call: per_call_cap_exceeded. No payment was requested.",
  "error": "policy_denied",
  "reason": "per_call_cap_exceeded",
  "path": "/v1/invoices",
  "attempted_usdc": 5.0,
  "cap_usdc": 2.0,
  "projected_usdc": 5.0,
  "mandate_id": "0x5881…",
  "spent_today_usdc": 3.0,
  "spent_month_usdc": 41.0,
  "spent_total_usdc": 41.0,
  "remaining_today_usdc": 22.0,
  "remaining_month_usdc": 159.0,
  "remaining_total_usdc": null,
  "calls": 12,
  "day_window_start": "2026-08-10T00:00:00",
  "month_window_start": "2026-08-01T00:00:00"
}
```

The body always carries the full spend summary, so an agent can decide what to do next without a second request. `X-POLICY-DENIED` is exposed via CORS, so browser clients can read it too.

## Reasons

| `X-POLICY-DENIED` | Meaning | What to do |
| --- | --- | --- |
| `mandate_not_found` | No mandate with that id on this chain's mount. | Check you are calling the right mount (`/v1` vs `/dev/v1`). |
| `mandate_wrong_chain` | The mandate was created on the other network. | Use the testnet mandate against `/dev/v1/…`, or create a mainnet one. |
| `mandate_revoked` | The controller or spender revoked it. | Ask the controller for a new mandate. |
| `mandate_not_yet_valid` | `not_before` is in the future. | Wait, or issue one starting now. |
| `mandate_expired` | Past `expires_at`. | Issue a fresh mandate. |
| `path_not_allowed` | This endpoint is not in `allowed_paths`. | The allowlist is in the 403 body — use a permitted service or widen the mandate. |
| `per_call_cap_exceeded` | This single call costs more than `per_call_cap_usdc`. | Choose a cheaper service; retrying will not help. |
| `daily_cap_exceeded` | Today's spend plus this call exceeds `daily_cap_usdc`. | Retry after `day_window_start` rolls over (00:00 UTC). |
| `monthly_cap_exceeded` | This month's spend plus this call exceeds `monthly_cap_usdc`. | Wait for the calendar month, or raise the cap. |
| `total_cap_exceeded` | Lifetime spend under this mandate is exhausted. | Issue a new mandate. |

`per_call_cap_exceeded`, `path_not_allowed`, `mandate_expired` and `mandate_revoked` are permanent for that mandate — do not retry. The window caps are temporary; `daily_reset_at` on the [status endpoint](/docs/for-agents/spend-mandates#check-the-remaining-budget) tells you exactly when.

## Denied after payment

If you do **not** send `X-MANDATE-ID`, the gateway cannot identify the governed wallet until the payment has been verified on-chain. Caps are still enforced at that point, but the funds have already moved. The response is still `403`, with two extra fields:

```json
{
  "detail": "Spend mandate denied this call: daily_cap_exceeded. Payment 0x7c1e… was already settled on-chain and is queued for refund. Send X-MANDATE-ID on the first request to be denied before paying.",
  "refund_status": "queued",
  "reason": "daily_cap_exceeded"
}
```

The call is recorded with status `policy_denied_refund_due` and enters the operator queue. It does **not** count against your caps.

:::tip
Always send `X-MANDATE-ID` on the first request. It is the difference between a free refusal and a refund ticket.
:::

## Not to be confused with

- **`402 Payment Required`** — normal; pay and retry. See [x402 Protocol](/docs/for-agents/x402-protocol).
- **`402` with `PAYMENT-INVALID`** — the payment itself failed verification (wrong amount, too few confirmations, reused tx hash). See [Replay Protection](/docs/for-agents/replay-protection) and [Error Codes](/docs/for-agents/error-codes).
- **`403` with `X-POLICY-DENIED`** — your own spending policy refused the call. Nothing is wrong with the payment rail.
