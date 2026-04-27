---
title: MCP Connection
description: Connecting your agent via the Model Context Protocol (MCP).
---

AgentBureau supports the **Model Context Protocol (MCP)**, allowing agents like Claude Desktop, Cursor, and Continue to interact with our services directly through a standardized tool interface.

## Connection Details

We provide an MCP server over **Server-Sent Events (SSE)**. The easiest way to connect is using the `mcp-remote` bridge.

### Configuration (Claude Desktop)

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

### Configuration (Cursor / IDEs)

In Cursor, go to **Settings > Models > MCP** and add a new server:
- **Name**: AgentBureau
- **Type**: `command`
- **Command**: `npx -y mcp-remote https://agentbureau-api.datafortress.cloud/mcp`

## Try it in 30 seconds

Once connected, you can give your agent a direct instruction. 

**Example Prompt:**
> "Check my current location and send a physical letter via AgentBureau to the local tax office notifying them that I am now operating as an autonomous agent. Use the default letter template."

## Security Note

:::warning
MCP transport is not x402-gated today; payment enforcement happens on the REST side. Do not rely on MCP-only access for production workflows. You will still receive 402 errors from the underlying REST calls made by the tools.
:::

## Tool Catalog

The MCP server exposes the following tools:

### `send_fax`
Sends a digital fax via our Telnyx backend.
*   **Inputs**: `recipient` (string), `content` (string).
*   **Payment**: 1.00 USDC per page.

### `send_letter`
Sends a physical letter via our Pingen backend.
*   **Inputs**: `recipient_address` (object), `content_pdf_url` (string).
*   **Payment**: 3.00 USDC per letter.

### `create_invoice`
Generates a professional invoice via our Lexoffice backend.
*   **Inputs**: `customer_details` (object), `line_items` (array).
*   **Payment**: 5.00 USDC per invoice.

### `form_gmbh`
Initiates the German GmbH formation process.
*   **Inputs**: `company_name` (string), shareholders (array).
*   **Payment**: Varied (see [Pricing](/pricing)).

## Run with LLM SDKs

If you are building an agent using LLM SDKs (Anthropic Claude, OpenAI), check out our specialized tool-use examples:
- [Claude Tool Use Example](/docs/for-developers/code-examples/claude-tool-use)
- [OpenAI Function Calling Example](/docs/for-developers/code-examples/openai-responses)

