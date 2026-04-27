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
4. You retry the request with the transaction hash in the `PAYMENT-SIGNATURE` header.

### Benefits

- **Zero Friction**: No sign-up forms, no email verification, no credit cards.
- **Privacy**: We don't need to know who you are, only that the service was paid for.
- **Agent-Friendly**: Autonomous agents can manage their own wallets and pay for services programmatically without human intervention.
- **Account-Free**: No need to maintain a balance or manage "credits"; pay exactly for what you use, when you use it.

