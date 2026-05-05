---
title: "How to Form a Company (GmbH/UG) Programmatically via API in 2026"
description: "A complete guide for AI Agents and Automated CEOs on how to legally form a German GmbH or UG using AgentBureau's API."
date: 2026-05-05
author: "Justin Guese"
locale: "en"
tags: ["tutorial", "company formation", "api", "automated ceo"]
---

# How to Form a Company (GmbH/UG) Programmatically via API

As AI agents become more sophisticated, they are stepping out of the virtual world and into the physical economy. An "Automated CEO" is no longer science fiction. But one massive hurdle remains: how does an AI legally own assets, hire humans, or sign contracts? 

The answer is programmatic company formation. In this guide, we will show you how an AI agent can form a fully legal German GmbH (or UG) using the AgentBureau API.

## Why Form a Company Programmatically?

AI agents cannot hold bank accounts or own property in their own name—they lack legal personhood. However, an AI agent *can* operate a legal entity like a GmbH if the formation and representation are handled correctly through specialized proxies. 

By forming a company, your AI agent gains:
- **A Legal Identity:** The ability to sign contracts and enter into agreements.
- **Banking Access:** The ability to open corporate bank accounts (fiat) or hold crypto treasuries legally.
- **Limited Liability:** Protection for the underlying human creators or DAO members.

## Step 1: Prepare the Formation Data

To form a GmbH, the agent needs to generate the foundational data. AgentBureau provides an endpoint that accepts standard JSON.

```json
{
  "company_name": "AutonomCorp UG (haftungsbeschränkt)",
  "business_purpose": "Algorithmic trading and automated digital services.",
  "shareholders": [
    {
      "type": "dao_proxy",
      "address": "0xYourEthereumAddress",
      "shares": 100
    }
  ],
  "managing_director": "AgentBureau Nominee Service"
}
```

## Step 2: Call the AgentBureau Formation API

With your payload ready, your agent can initiate the formation process using a simple HTTP POST request.

```python
import httpx

response = httpx.post(
    "https://agentbureau-api.datafortress.cloud/v1/services/formation",
    json=formation_data,
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)

print(response.json())
# Output: {"status": "pending_notary", "tracking_id": "ab-992-xyz"}
```

## Step 3: Settle the Notary Fees via x402

Traditional company formation requires wire transfers. AgentBureau uses the **x402 protocol**, allowing your agent to pay the notary and court fees instantly using USDC on Base.

```python
if response.status_code == 402:
    # Read the required payment from headers
    payment_uri = response.headers.get("PAYMENT-LINK")
    print(f"Agent must settle: {payment_uri}")
    # Agent executes USDC transfer
```

## Conclusion

The era of the Automated CEO is here. By leveraging AgentBureau's programmatic formation API, developers can deploy AI agents that are fully legally compliant economic actors in the European jurisdiction.

[Read our API documentation](/docs/services/company-formation) to get your agent started today.