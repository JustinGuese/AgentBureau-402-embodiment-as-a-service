AgentBureau provides Embodiment-as-a-Service for AI agents, allowing them to perform real-world legal and physical actions in the German jurisdiction using permissionless x402 payment gating.

Services & Pricing
┌──────────────────┬─────────────────────┬──────────────┬──────────────────────┐
│ Service │ Tool Name │ Price (USDC) │ Delivery Method │
├──────────────────┼─────────────────────┼──────────────┼──────────────────────┤
│ Digital Invoice │ send_german_invoice │ 5.00 │ via Lexoffice │
│ Physical Letter │ send_letter │ 3.00 │ via Pingen (Germany) │
│ Programmatic Fax │ send_fax │ 1.00 │ via Telnyx │
│ GmbH Formation │ form_german_company │ 15,500 │ HITL Concierge¹ │
│ UG Formation │ form_german_company │ 1,500+ │ HITL Concierge² │
└──────────────────┴─────────────────────┴──────────────┴──────────────────────┘

¹ Includes 3,000 USDC fee + 12,500 USDC share capital.  
 ² Includes 1,500 USDC fee + custom share capital (1 - 12,500 USDC).

How It Works
AgentBureau uses the x402 protocol, where payments on the Base L2 network serve as both the service fee and the authentication mechanism.

1.  Discovery: Your agent reads the /.well-known/x402 manifest or the MCP server definition to find tool prices and the recipient wallet.
2.  Challenge: The agent sends a request (e.g., to /v1/letters). The server responds with an HTTP 402 Payment Required and an EIP-681 link.
3.  Settlement: The agent (or its wallet) transfers the required USDC to the AgentBureau vault on Base.
4.  Verification: The agent retries the request with the transaction hash in the PAYMENT-SIGNATURE header.
5.  Execution (HITL): Our Human-in-the-Loop operators receive a notification, verify the on-chain settlement, and manually execute the physical/legal action (e.g., mailing the letter or filing the notary papers).
6.  Escrow: For company formations, the share capital is held in a secure escrow and released to the new company's bank account once registration is finalized.

## Core Concept: x402 Payment Gating

This API uses the **x402 protocol** for permissionless, account-free authentication. Instead of API keys, every request to a "priced" endpoint is authenticated by a USDC payment transaction hash on the Base network.

### How it works for Agents:

1. **Discover**: Agents read `/.well-known/x402` or `/.well-known/ai-plugin.json` to find tool prices.
2. **Initial Request**: Agent sends a `POST` to a service endpoint (e.g., `/v1/invoices`) without authentication.
3. **402 Challenge**: The server responds with an **HTTP 402 Payment Required**.
   - `PAYMENT-LINK` header: An EIP-681 link (e.g., `ethereum:0xUSDC@8453/transfer?address=0xGmbH&uint256=5000000`)
   - Response body: Contains the exact amount, currency (USDC), and target wallet.
4. **Payment**: The agent (or its wallet) sends the specified USDC amount to the GmbH wallet on Base.
5. **Retry**: The agent retries the original request with the transaction hash in the `PAYMENT-SIGNATURE` header.
6. **Execution**: The server verifies the transaction on-chain and proceeds with the request (Human-in-the-Loop).

## Available Services

| Endpoint                   | Tool Name             | Price (USDC) | Description                                             |
| -------------------------- | --------------------- | ------------ | ------------------------------------------------------- |
| `/v1/invoices`             | `send_german_invoice` | 5.00         | Generate and send a digital invoice via Lexoffice.      |
| `/v1/letters`              | `send_letter`         | 3.00         | Print and mail a physical letter in Germany via Pingen. |
| `/v1/fax`                  | `send_fax`            | 1.00         | Send a programmatic fax via Telnyx.                     |
| `/v1/companies/formations` | `form_german_company` | Dynamic      | Start the formation of a German GmbH/UG.                |

### Formation Pricing (Dynamic)

- **UG Formation**: 1,500 USDC (Service Fee) + `stammkapital` (1 to 12,500 USDC).
- **GmbH Formation**: 3,000 USDC (Service Fee) + 12,500 USDC (Min. Stammkapital).
- **Physical Letters during process**: Included in base fee.

### Single-Deposit Escrow Workflow

For company formations, agents make a **single upfront deposit** covering both the service fee and the share capital (Stammkapital).

1. **Request**: Agent submits formation data (UG/GmbH + Stammkapital amount).
2. **402 Challenge**: Server responds with 402, specifying the total required USDC (Fee + Stammkapital).
3. **Payment**: Agent pays the total amount in one transaction.
4. **HITL Execution**: AgentBureau handles the notary, registration, and bank account setup.
5. **Capital Release**: Once the company is registered, the Stammkapital is released to the new company's bank account (held in escrow until then).

## Features

- **Permissionless**: No sign-ups or API keys required. Payment _is_ authentication.
- **Base L2 Native**: Low-cost, fast settlement using USDC.
- **MCP Native**: Full support for Model Context Protocol (SSE transport at `/mcp`).
- **HITL (Human-in-the-Loop)**: Every action is reviewed and executed by a human operator for maximum reliability and legal compliance.

## Runnable Examples

We provide a comprehensive set of runnable scripts demonstrating how to integrate AgentBureau services across various languages and frameworks. All examples handle the full x402 payment flow (Challenge -> Payment -> Retry).

| Client | Fax | Letter | Invoice | GmbH |
| :--- | :---: | :---: | :---: | :---: |
| **cURL / Bash** | [fax.sh](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/curl/fax.sh) | [letter.sh](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/curl/letter.sh) | [invoice.sh](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/curl/invoice.sh) | [gmbh.sh](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/curl/gmbh.sh) |
| **Python** | [fax.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/python/fax.py) | [letter.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/python/letter.py) | [invoice.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/python/invoice.py) | [gmbh.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/python/gmbh.py) |
| **TypeScript** | [fax.ts](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/typescript/fax.ts) | [letter.ts](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/typescript/letter.ts) | [invoice.ts](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/typescript/invoice.ts) | [gmbh.ts](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/typescript/gmbh.ts) |
| **LangChain** | [fax.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/langchain/fax.py) | [letter.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/langchain/letter.py) | [invoice.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/langchain/invoice.py) | [gmbh.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/langchain/gmbh.py) |
| **Claude** | [fax.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/claude-tool-use/fax.py) | [letter.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/claude-tool-use/letter.py) | [invoice.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/claude-tool-use/invoice.py) | [gmbh.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/claude-tool-use/gmbh.py) |
| **OpenAI** | [fax.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/openai-responses/fax.py) | [letter.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/openai-responses/letter.py) | [invoice.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/openai-responses/invoice.py) | [gmbh.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/openai-responses/gmbh.py) |

You can find all source code in the [examples/](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/tree/main/examples) directory.

## Setup

1. Install `uv` if you haven't already.
2. `uv sync`
3. `cp .env.example .env` (adjust values if needed)
4. `uv run uvicorn gateway.main:app --reload`

## Testing

- **Unit Tests**: `uv run pytest`
- **Live E2E Tests**: Requires a funded wallet and `ENV=dev`. See `docs/testnet-e2e.md`.
  ```bash
  uv run pytest -m live tests/live/test_formation_live.py -v
  ```

## AgentBureau / MCP Integration

To use these tools in your agent, add this to your `mcp_servers.yaml`:

```yaml
agent-bureau:
  url: https://api.agentbureau.de/mcp
  transport: sse
```
