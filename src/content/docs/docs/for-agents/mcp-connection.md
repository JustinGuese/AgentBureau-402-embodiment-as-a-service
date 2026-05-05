---
title: MCP Connection
description: Connecting your agent via the Model Context Protocol (MCP).
---

AgentBureau supports the **Model Context Protocol (MCP)**, allowing agents like Claude Desktop, Cursor, and Continue to interact with our services directly through a standardized tool interface.

## Connection Details

We provide a remote MCP server over **Streamable HTTP** at `https://agentbureau-api.datafortress.cloud/mcp`. Clients that speak the modern MCP HTTP transport (Claude Desktop ≥ 0.9, Cursor, Smithery Gateway) can connect directly. For clients that still expect a stdio-only server, use the `mcp-remote` bridge.

### Option 1: Smithery (one-click install)

The fastest way to get AgentBureau into Claude Desktop, ChatGPT, Cursor, or Windsurf is via Smithery, which proxies through `agentbureau--guese-justin.run.tools` and handles transport negotiation:

👉 **[Install AgentBureau on Smithery](https://smithery.ai/servers/guese-justin/AgentBureau)**

No API key, no parameters — payment is handled per-call via x402.

### Option 2: Direct connection (Claude Desktop)

To add AgentBureau to Claude Desktop, add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "AgentBureau": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://agentbureau-api.datafortress.cloud/mcp"]
    }
  }
}
```

### Option 3: Cursor / IDEs

In Cursor, go to **Settings > Models > MCP** and add a new server:
- **Name**: AgentBureau
- **Type**: `command`
- **Command**: `npx -y mcp-remote https://agentbureau-api.datafortress.cloud/mcp`

## Try it in 30 seconds

Once connected, you can give your agent direct instructions to "handle the German bureaucracy":

**Establish Legal Personality**
> "Incorporate a new German UG for my AI startup via the HITL concierge."

**Bypass Analog Bureaucracy**
> "Fax this address verification document to the Berlin commercial register to satisfy Schriftform requirements."

**Automate Financial Operations**
> "Generate a compliant German invoice for 5,000 EUR and submit my quarterly VAT return."

**Manage Corporate Compliance**
> "Create the annual filing for my company in the Bundesanzeiger."

**Secure Physical Presence**
> "Send a physical, legally-binding letter to this recipient in Germany."

**Scale Institutional Agency**
> "Register my agent-owned entity for a VAT ID and open a SEPA-compliant bank account."

## Payment Flow

Every MCP tool call dispatches through the same x402-gated REST endpoint as a direct HTTP request. When you call a paid tool without a valid payment, the tool returns an error containing the full payment payload — `payment_link` (EIP-681), `intent_id`, `amount`, `currency`, `chain_id`, and `network`. Your agent extracts those, sends USDC on Base, and retries the call with the transaction hash. See [Funding Your Base Wallet](/docs/reference/funding-base-wallet) for first-time setup.

## Tool Catalog

The MCP server exposes 12 tools, all gated by x402 USDC payments on Base mainnet. Inputs match the corresponding REST endpoint schemas — see the [REST API Reference](/docs/for-developers/rest-api-reference) for full field documentation.

**Tool list** (for marketplace listings / agent manifests):

```
send_fax (Send Fax), send_letter (Send Physical Letter), create_invoice (Create German Invoice), collect_debt (Initiate Debt Collection), submit_vat_return (Submit VAT Return), issue_vollmacht (Issue Power of Attorney), create_annual_filing (Submit Annual Filing), register_vat (Register for VAT), open_bank_account (Open Corporate Bank Account), issue_vollmacht_notarized (Issue Notarized Power of Attorney), form_company (Form GmbH or UG Company), eu_presence_bundle (Establish EU Presence Bundle)
```


| Tool | Action | Cost (USDC) |
|---|---|---|
| `send_fax` | Send a fax to a German number with legal transmission report | 1.00 |
| `send_letter` | Send a physical letter via Deutsche Post / Pingen | 3.00 |
| `create_invoice` | Generate a GoBD-compliant German invoice | 5.00 |
| `collect_debt` | Initiate Inkasso (debt collection) | 50.00 |
| `submit_vat_return` | Submit VAT return via ELSTER | 100.00 |
| `issue_vollmacht` | Issue a non-notarized Power of Attorney | 200.00 |
| `create_annual_filing` | Submit annual filing to the Bundesanzeiger | 200.00 |
| `register_vat` | Register for VAT (Umsatzsteuer) at the German tax office | 500.00 |
| `open_bank_account` | Open a corporate bank account (Penta / Qonto / Fyrst) | 500.00 |
| `issue_vollmacht_notarized` | Issue a notarized Power of Attorney with optional Apostille | 1500.00 |
| `form_company` | Initiate UG / GmbH formation (held in milestone escrow) | Dynamic |
| `eu_presence_bundle` | Establish full EU presence: formation + VAT + office | 5000.00 |

## Run with LLM SDKs

If you are building an agent using LLM SDKs (Anthropic Claude, OpenAI), check out our specialized tool-use examples:
- [Claude Tool Use Example](/docs/for-developers/code-examples/claude-tool-use)
- [OpenAI Function Calling Example](/docs/for-developers/code-examples/openai-responses)

