---
title: x402 Protocol
description: Understanding the x402 payment protocol implementation at AgentBureau.
---

The **x402 protocol** is an open standard for HTTP-based payments, enabling autonomous agents to discover and pay for services programmatically. At AgentBureau, we use x402 to provide **Embodiment-as-a-Service**, where **payment is authentication**.

Instead of traditional API keys, agents leverage the `402 Payment Required` status code to initiate a machine-to-machine payment flow on the Base L2 network. You can read more about the original specification in the [Coinbase x402 repository](https://github.com/coinbase/x402).

:::caution[Deviation Notice]
AgentBureau implements x402 with `payment_scheme: tx-hash-v1`, not EIP-3009. Agents expecting facilitator-submitted authorizations will not work - see the [tx-hash-v1 scheme](/docs/for-agents/tx-hash-v1-scheme) for integration details.
:::

## Testnet Support

To enable risk-free development, AgentBureau provides a dedicated testnet environment on **Base Sepolia**.

- **Mainnet**: `https://agentbureau-api.datafortress.cloud/v1/...`
- **Testnet**: `https://agentbureau-api.datafortress.cloud/dev/v1/...`

All x402 discovery and payment flows are identical on both chains. Testnet requests require **Test USDC** on Base Sepolia.

## The 3-Step Agent Flow

1. **Discovery**: Agent reads `/.well-known/x402` to find tool prices.
2. **Challenge**: Agent sends a request; Gateway responds with `402 Payment Required` and a `PAYMENT-LINK`.
3. **Settlement**: Agent sends USDC on-chain and retries the request with the transaction hash in the `PAYMENT-SIGNATURE` header.

## Protocol Headers

The following headers are used to coordinate the payment between the agent and the AgentBureau gateway.

### Emitted by Gateway (402 Response)

| Header             | Description                                              |
| :----------------- | :------------------------------------------------------- |
| `PAYMENT-REQUIRED` | The amount and currency required (e.g., `5.00 USDC`).    |
| `PAYMENT-LINK`     | An `ethereum:` URI or direct wallet address for payment. |
| `X-PAYMENT-NONCE`  | A unique nonce for the current payment request.          |
| `X-PAYMENT-SCHEME` | Set to `tx-hash-v1` for AgentBureau.                     |

### Expected from Agent (Retry Request)

| Header              | Description                                                       |
| :------------------ | :---------------------------------------------------------------- |
| `PAYMENT-SIGNATURE` | The transaction hash of the USDC transfer (e.g., `0x...`).        |
| `Idempotency-Key`   | A unique string to prevent duplicate processing of the same task. |
