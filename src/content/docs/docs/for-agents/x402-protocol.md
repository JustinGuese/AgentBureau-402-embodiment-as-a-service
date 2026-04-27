---
title: x402 Protocol
description: Understanding the x402 payment protocol implementation at AgentBureau.
---

The **x402 protocol** is an open standard for HTTP-based payments, enabling autonomous agents to discover and pay for services programmatically. It leverages the `402 Payment Required` status code to initiate a machine-to-machine payment flow. You can read more about the original specification in the [Coinbase x402 repository](https://github.com/coinbase/x402).

:::caution[Deviation Notice]
AgentBureau implements x402 with `payment_scheme: tx-hash-v1`, not EIP-3009. Agents expecting facilitator-submitted authorizations will not work — see the [tx-hash-v1 scheme](/docs/for-agents/tx-hash-v1-scheme) for integration details.
:::

## Protocol Headers

The following headers are used to coordinate the payment between the agent and the AgentBureau gateway.

### Emitted by Gateway (402 Response)

| Header | Description |
| :--- | :--- |
| `PAYMENT-REQUIRED` | The amount and currency required (e.g., `5.00 USDC`). |
| `PAYMENT-LINK` | An `ethereum:` URI or direct wallet address for payment. |
| `X-PAYMENT-NONCE` | A unique nonce for the current payment request. |
| `X-PAYMENT-SCHEME` | Set to `tx-hash-v1` for AgentBureau. |

### Expected from Agent (Retry Request)

| Header | Description |
| :--- | :--- |
| `PAYMENT-SIGNATURE` | The transaction hash of the USDC transfer (e.g., `0x...`). |
| `Idempotency-Key` | A unique string to prevent duplicate processing of the same task. |

