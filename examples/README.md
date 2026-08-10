# AgentBureau Runnable Code Examples

> [!TIP]
> View these examples with full explanations in our [Official Documentation](https://agentbureau-api.datafortress.cloud/docs/for-developers/code-examples/).

This directory contains a 6×4 matrix of runnable scripts demonstrating how to integrate with AgentBureau services (Fax, Letter, Invoice, GmbH Formation) across various clients.


## Matrix Overview

| Client | Fax | Letter | Invoice | GmbH |
| :--- | :---: | :---: | :---: | :---: |
| **cURL / Bash** | [fax.sh](./curl/fax.sh) | [letter.sh](./curl/letter.sh) | [invoice.sh](./curl/invoice.sh) | [gmbh.sh](./curl/gmbh.sh) |
| **Python (httpx)** | [fax.py](./python/fax.py) | [letter.py](./python/letter.py) | [invoice.py](./python/invoice.py) | [gmbh.py](./python/gmbh.py) |
| **TypeScript (viem)** | [fax.ts](./typescript/fax.ts) | [letter.ts](./typescript/letter.ts) | [invoice.ts](./typescript/invoice.ts) | [gmbh.ts](./typescript/gmbh.ts) |
| **LangChain** | [fax.py](./langchain/fax.py) | [letter.py](./langchain/letter.py) | [invoice.py](./langchain/invoice.py) | [gmbh.py](./langchain/gmbh.py) |
| **Claude Tool Use** | [fax.py](./claude-tool-use/fax.py) | [letter.py](./claude-tool-use/letter.py) | [invoice.py](./claude-tool-use/invoice.py) | [gmbh.py](./claude-tool-use/gmbh.py) |
| **OpenAI Responses** | [fax.py](./openai-responses/fax.py) | [letter.py](./openai-responses/letter.py) | [invoice.py](./openai-responses/invoice.py) | [gmbh.py](./openai-responses/gmbh.py) |

## Spend Governance

Separate from the service matrix, because a mandate is not a service — it is a cap that
applies to all of them. These scripts create a signed spend mandate, then show the gateway
refusing an over-budget call.

| Client | Spend Mandate |
| :--- | :--- |
| **cURL / Bash** | [mandate.sh](./curl/mandate.sh) |
| **Python (web3)** | [mandate.py](./python/mandate.py) |
| **TypeScript (viem)** | [mandate.ts](./typescript/mandate.ts) |

**These three need no USDC and send no transaction.** A mandate is a signature, and an
over-budget call is refused *before* a payment is requested — so unlike everything in the
matrix above, they run end to end on an empty wallet. That makes them the cheapest way to
see the API respond to a real signed request.

```bash
PRIVATE_KEY=0x... API_BASE=https://agentbureau-api.datafortress.cloud/dev/v1 \
  python python/mandate.py
```

Expected output:

```
POST /fax      (1.00 USDC) -> 402 payment requested, as normal
POST /invoices (5.00 USDC) -> 403 X-POLICY-DENIED: per_call_cap_exceeded
  attempted 5.0 USDC against a cap of 2.0 USDC
POST /legal/inkasso        -> 403 X-POLICY-DENIED: path_not_allowed
```

Full reference: [Spend Mandates](https://agentbureau.de/docs/for-agents/spend-mandates) ·
[Policy Denied (403)](https://agentbureau.de/docs/reference/policy-denied)

## Quick Start

1. **Clone the repo**:
   ```bash
   git clone https://github.com/JustinGuese/website-openclawgatewaycompanyapi.git
   cd website-openclawgatewaycompanyapi/examples
   ```

2. **Setup environment**:
   Copy `.env.example` to `.env` and fill in your credentials.
   ```bash
   cp .env.example .env
   ```

3. **Install dependencies**:
   - **Python**: `pip install -r python/requirements.txt`
   - **TypeScript**: `cd typescript && npm install`

## GitHub Raw URLs for AI Agents

Agents can fetch these scripts directly to understand the implementation pattern:
`https://raw.githubusercontent.com/JustinGuese/website-openclawgatewaycompanyapi/main/examples/<client>/<service>.<ext>`
