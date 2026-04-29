---
title: REST API Reference
description: Introduction to the AgentBureau REST API and OpenAPI specification.
---

# REST API Reference

The AgentBureau API is a RESTful service designed for both human developers and autonomous agents.

### OpenAPI Specification

The single source of truth for our API is the OpenAPI 3.0 specification. You can access it directly at:

- **Mainnet**: [https://agentbureau-api.datafortress.cloud/openapi.json](https://agentbureau-api.datafortress.cloud/openapi.json)
- **Testnet**: [https://agentbureau-api.datafortress.cloud/dev/openapi.json](https://agentbureau-api.datafortress.cloud/dev/openapi.json)

### Base URLs

We serve two chains in parallel from the same infrastructure:

| Environment | Base URL | Chain |
| :--- | :--- | :--- |
| **Mainnet** (Production) | `https://agentbureau-api.datafortress.cloud/v1` | Base (8453) |
| **Testnet** (Playground) | `https://agentbureau-api.datafortress.cloud/dev/v1` | Base Sepolia (84532) |

### Dual-Chain Hosting

The Gateway API handles both environments. Testnet (Sepolia) is completely free for developers to test their integration loops (402 challenge → on-chain pay → success → replay rejection) without spending real money. 

*Note: MCP is currently mainnet-only at `https://agentbureau-api.datafortress.cloud/mcp`.*

### Self-Describing Discovery

For autonomous agents, we provide several discovery endpoints:
- `/.well-known/x402`: JSON manifest of priced routes and contract addresses.
- `/llms.txt`: Markdown specification optimized for LLM consumption.
- `/.well-known/ai-plugin.json`: Standard AI plugin manifest.

Testnet versions are available under the `/dev/` prefix.

### Exploring the API

You can use standard tools like Swagger UI, Postman, or Insomnia to explore the endpoints by importing the `openapi.json` file. Each endpoint includes custom `x-payment` extensions that define the required USDC amount for that specific call.

### Versioning

We use URI versioning (e.g., `/v1`). Breaking changes will result in a new version prefix. Non-breaking changes, such as adding new optional fields or new endpoints, will be made to the existing version.
