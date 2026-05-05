---
title: x402 Protocol
description: Understanding the x402 payment protocol implementation at AgentBureau.
---

The **x402 protocol** is an open standard for HTTP-based payments, enabling autonomous agents to discover and pay for services programmatically. At AgentBureau, we use x402 to provide **Embodiment-as-a-Service**, where **payment is authentication**.

Instead of traditional API keys, agents leverage the `402 Payment Required` status code to initiate a machine-to-machine payment flow on the Base L2 network. You can read more about the original specification in the [Coinbase x402 repository](https://github.com/coinbase/x402).

:::caution[Deviation Notice]
AgentBureau implements x402 with `payment_scheme: tx-hash-v1`, not EIP-3009. Agents expecting facilitator-submitted authorizations will not work - see the [tx-hash-v1 scheme](/docs/for-agents/tx-hash-v1-scheme) for integration details.
:::

## Testnet & Dual-Chain Development

To enable risk-free development, AgentBureau provides a dedicated testnet environment on **Base Sepolia**. This is one of our strongest features for developers: you can test the full payment and HITL flow for free.

- **Mainnet**: `https://agentbureau-api.datafortress.cloud/v1/...`
- **Testnet**: `https://agentbureau-api.datafortress.cloud/dev/v1/...`

All x402 discovery and payment flows are identical on both chains. Testnet requests require **Test USDC** on Base Sepolia.

## Settlement Constraints

To ensure protocol integrity and prevent stale payment processing, the following constraints apply to all transaction hashes:

- **Tx Recency**: Transactions must be less than **43,200 confirmations** old (~24 hours on Base). Retrying with a transaction older than this will result in a `Transaction too old` error.
- **Confirmation Thresholds**:
    - **Standard Transfers** (Fax, Letter, Invoice): **1 confirmation** required.
    - **Escrow Deposits** (GmbH Formation): **3 confirmations** required to ensure finality before registration.

Agents should budget their polling/retry logic accordingly.

## The 4-Step Agent Flow

1. **Discovery**: Agent reads `/.well-known/x402` to find tool prices.
2. **Challenge**: Agent sends a request with an `Idempotency-Key`; Gateway responds with `402 Payment Required`, a `PAYMENT-LINK`, and an `X-PAYMENT-INTENT-ID`.
3. **Settlement**: Agent sends USDC on-chain.
4. **Authorization & Retry**: Agent signs the message `AgentBureau Intent: {intent_id}` with their wallet and retries the request with both the transaction hash (`PAYMENT-SIGNATURE`) and the signature (`PAYMENT-AUTHORIZATION`).

### Pre-computing Intent ID

Sophisticated agents can pre-compute the `intent_id` to reduce latency. The ID is a **Keccak-256 hash** of the following preimage, always represented as a **hexadecimal string with a `0x` prefix**:


`{chain_name}:{recipient_address}:{amount_raw}:{lookup_path}:{idempotency_key}`

*   `chain_name`: "mainnet" or "testnet"
*   `recipient_address`: The GMBH wallet address (lowercase).
*   `amount_raw`: The exact amount in 6-decimal USDC base units (e.g., "5000000" for 5.00 USDC).
*   `lookup_path`: The normalized API path (e.g., "/v1/fax").
*   `idempotency_key`: Your unique UUID v4.


## Protocol Headers

The following headers are used to coordinate the payment between the agent and the AgentBureau gateway.

### Emitted by Gateway (402 Response)

| Header                   | Description                                              |
| :----------------------- | :------------------------------------------------------- |
| `PAYMENT-REQUIRED`       | The amount and currency required (e.g., `5.00 USDC`).    |
| `PAYMENT-LINK`           | An `ethereum:` URI or direct wallet address for payment. |
| `X-PAYMENT-INTENT-ID`    | A unique ID for this specific payment intent.            |
| `X-PAYMENT-SCHEME`       | Set to `tx-hash-v1` for AgentBureau.                     |
| `X-OPERATOR-SIGNATURE`   | (Escrow only) A signature required for contract deposits. |

### Expected from Agent (Retry Request)

| Header                  | Description                                                               |
| :---------------------- | :------------------------------------------------------------------------ |
| `PAYMENT-SIGNATURE`     | The transaction hash of the USDC transfer (e.g., `0x...`).                |
| `PAYMENT-AUTHORIZATION` | An EIP-191 signature of the message `AgentBureau Intent: {intent_id}`.    |
| `Idempotency-Key`       | **Mandatory.** A unique UUID v4 to ensure deterministic execution.        |
