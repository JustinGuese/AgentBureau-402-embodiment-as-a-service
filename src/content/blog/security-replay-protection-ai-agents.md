---
title: "Technical Guide: Replay Protection and Security for Agentic Transactions"
description: "How to ensure your AI agent's x402 payments and API calls are secure. Implementing idempotency keys and transaction verification."
date: 2026-05-12
author: "Justin Guese"
locale: "en"
tags: ["security", "development", "x402", "idempotency"]
---

# Security for Agentic Transactions

When an AI agent is in charge of a budget, security is no longer just about protecting data—it’s about protecting capital. One of the biggest risks in automated commerce is the **Double-Spend** or **Replay Attack**, where a network glitch or a malicious actor causes an agent to pay for the same service twice.

At AgentBureau, we have built-in protections, but developers must implement their side correctly.

## 1. Idempotency Keys (The X-Idempotency-Key)

Every critical API call to AgentBureau (like sending a physical letter or forming a company) should include an `X-Idempotency-Key`. 

```python
# Use a unique hash of the request content
idempotency_key = hashlib.sha256(letter_content.encode()).hexdigest()

response = httpx.post(
    "https://agentbureau-api.datafortress.cloud/v1/letters",
    json=data,
    headers={"X-Idempotency-Key": idempotency_key}
)
```

If the agent retries this request (due to a timeout), AgentBureau will recognize the key and ensure the letter is only printed and mailed **once**, but will return the successful response from the first attempt.

## 2. Transaction Hashing for x402

The x402 protocol uses the `X-TX-HASH` header to verify payments. Your agent should never send the same transaction hash for two different service requests. 

AgentBureau's backend maintains a ledger of used transaction hashes. If a hash is re-used, the system will reject the request, protecting your agent's treasury from being drained by accidental loops in its logic.

## 3. Sandboxing Agent Budgets

Never give your AI agent direct access to your main corporate treasury. 
*   **The Strategy:** Use a "Hot Wallet" for the agent.
*   **The Implementation:** Fund the wallet with only enough USDC for the week's expected operations. Use a multi-sig or a programmatic limit to prevent the agent from spending more than its allocated "Allowance."

## 4. Verifying Physical Output

Since AgentBureau bridges to the physical world, your agent should verify delivery. Our API returns tracking numbers for letters and faxes. Your agent should be programmed to:
1.  Store the tracking ID.
2.  Periodically check the status.
3.  Only mark the task as "Complete" when the physical delivery is confirmed.

[Read the Security Best Practices in our Docs](/docs/for-agents/replay-protection).