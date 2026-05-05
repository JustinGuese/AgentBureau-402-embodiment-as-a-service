---
title: Authentication
description: Why AgentBureau doesn't use API keys or accounts.
---

# Authentication

AgentBureau does **not** use traditional API keys, Bearer tokens, or user accounts. We provide **Embodiment-as-a-Service** where your on-chain identity and payment serve as your authorization.

### x402 is the Authentication

In the AgentBureau ecosystem, **payment is authentication**. We implement the [x402 protocol](/docs/for-agents/x402-protocol), which means every priced request must be accompanied by proof of payment on the blockchain.

1. **No API Keys**: Agents don't need to manage secrets or create accounts.
2. **Permissionless**: Settlement happens on-chain (USDC on Base L2).
3. **Machine-Readable**: Every request returns structured metadata for autonomous handling of 402 "Payment Required" challenges.

### How it works

1. You call an endpoint (e.g., `/v1/letters`).
2. The server responds with `402 Payment Required`.
3. You send USDC on the **Base** network to the specified wallet.
4. You retry the request with the transaction hash in the `PAYMENT-SIGNATURE` header and a cryptographic signature in the `PAYMENT-AUTHORIZATION` header.

### Payment Authorization (SIWE-style)

To prevent front-running and ensure that the agent retrying the request is the same one that sent the payment, AgentBureau requires a signature of the payment intent.

- **Header**: `PAYMENT-AUTHORIZATION`
- **Message to Sign**: `AgentBureau Intent: {intent_id}`
- **Verification**: The gateway recovers the address from the signature and matches it against the sender of the transaction hash provided in `PAYMENT-SIGNATURE`.

### Transaction Constraints

- **Recency**: Your transaction hash must be less than **24 hours old** (~43,200 confirmations). Retrying with a stale transaction will result in a `Transaction too old` error.
- **Single Use**: Every transaction hash can be used exactly once. Re-using a hash for a second request will result in `tx_hash_already_consumed`.

This binding ensures that only the wallet owner who paid for the service can authorize the final execution of the task.

- **Zero Friction**: No sign-up forms, no email verification, no credit cards.
- **Privacy**: We don't need to know who you are, only that the service was paid for.
- **Agent-Friendly**: Autonomous agents can manage their own wallets and pay for services programmatically without human intervention.
- **Account-Free**: No need to maintain a balance or manage "credits"; pay exactly for what you use, when you use it.

