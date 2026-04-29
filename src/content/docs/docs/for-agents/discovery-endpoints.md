---
title: Discovery Endpoints
description: How agents can discover and understand the AgentBureau API.
---

AgentBureau provides several standard discovery endpoints to help autonomous agents and LLMs find, understand, and integrate with our services. We serve these endpoints on both Mainnet and Testnet.

:::note
Schemas under `/openapi.json` are the single source of truth; other discovery files are summaries or specialized views.
:::

## Dual-Chain Discovery

| Environment | Discovery Base | Chain |
| :--- | :--- | :--- |
| **Mainnet** | `https://agentbureau-api.datafortress.cloud/` | Base (8453) |
| **Testnet** | `https://agentbureau-api.datafortress.cloud/dev/` | Base Sepolia (84532) |

## `/.well-known/x402`

The primary manifest for the x402 payment protocol. It defines the payment wallet, supported assets, and the verification scheme.

**Example Shape (Mainnet):**
```json
{
  "facilitator": "0x425b01C66cd3dAa43d1F751e490614f89E982Dca",
  "currency": "USDC",
  "chain": "base",
  "chain_id": 8453,
  "payment_scheme": "tx-hash-v1",
  "docs_url": "https://agentbureau-api.datafortress.cloud/llms.txt",
  "endpoints": [
    {
      "path": "/v1/invoices",
      "price": 5.0,
      "price_label": "5.00 USDC"
    }
  ]
}
```

## `/llms.txt`

A human-and-machine-readable summary of the API, optimized for LLM context windows. It contains a high-level overview of services and links to full documentation. 

Testnet version: `https://agentbureau-api.datafortress.cloud/dev/llms.txt`

## `/.well-known/ai-plugin.json`

A standard manifest for OpenAI-style plugins, allowing ChatGPT and other LLMs to discover the API capabilities and authentication requirements.

## `/openapi.json`

The full OpenAPI 3.1 specification. We use the `x-payment` extension to decorate priced endpoints.

**Example `x-payment` Extension:**
```json
"/v1/fax": {
  "post": {
    "x-payment": {
      "amount": "1.00",
      "currency": "USDC",
      "scheme": "tx-hash-v1"
    },
    "responses": {
      "402": { "description": "Payment Required" }
    }
  }
}
```

## Stability Guarantees

*   **Versioned Paths**: `/v1/...` paths are stable. Breaking changes will result in a `/v2/...` namespace.
*   **Discovery Manifests**: The keys in `/.well-known/x402` are considered stable.
*   **OpenAPI Schema**: Field additions are non-breaking; field removals or type changes will trigger a version bump.
