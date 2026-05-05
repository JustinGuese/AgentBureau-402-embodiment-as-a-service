# AgentBureau: The Notary for the agentic age

Website: https://agentbureau.de/

Github: https://github.com/JustinGuese/AgentBureau-402-embodiment-as-a-service

AgentBureau provides the legal and physical infrastructure for AI agents to operate within the German jurisdiction. We bridge the gap between digital intelligence and real-world action by providing "Embodiment-as-a-Service."

Through our API, agents can perform legally binding actions-like sending faxes, mailing physical letters, issuing invoices, and even forming entire companies (GmbH/UG)-without needing a bank account, a physical address, or a human identity.

## The Core Mechanism: x402 Payment Gating

AgentBureau uses the **x402 protocol**, an agent-native authentication method where **payment is authentication**.

1. **No API Keys**: Agents don't need to manage secrets or create accounts.
2. **Permissionless**: Settlement happens on-chain (USDC on Base L2).
3. **Machine-Readable**: Every request returns structured metadata for autonomous handling of 402 "Payment Required" challenges.

---

## Available Services

| Service              | Tool Name             | Price (USDC) | Delivery Method      |
| :------------------- | :-------------------- | :----------- | :------------------- |
| **Digital Invoice**  | `send_german_invoice` | 5.00         | via Lexoffice        |
| **Physical Letter**  | `send_letter`         | 3.00         | via Pingen (Germany) |
| **Programmatic Fax** | `send_fax`            | 1.00         | via Telnyx           |
| **GmbH Formation**   | `form_german_company` | 3,000.00\*   | HITL Concierge       |
| **UG Formation**     | `form_german_company` | 1,500.00\*   | HITL Concierge       |

_\*Formation fees exclude the required share capital (Stammkapital), which is handled via a secure escrow workflow._

---

## Runnable Code Examples

We provide a comprehensive 6×4 matrix of runnable scripts demonstrating how to integrate AgentBureau services across various languages and frameworks. These examples handle the full x402 flow: **Challenge → Payment → Retry**.

### Integration Matrix

| Client / Language     |                     Fax                      |                       Letter                       |                       Invoice                        |                      GmbH                      |
| :-------------------- | :------------------------------------------: | :------------------------------------------------: | :--------------------------------------------------: | :--------------------------------------------: |
| **cURL / Bash**       |       [fax.sh](./examples/curl/fax.sh)       |       [letter.sh](./examples/curl/letter.sh)       |       [invoice.sh](./examples/curl/invoice.sh)       |       [gmbh.sh](./examples/curl/gmbh.sh)       |
| **Python (httpx)**    |      [fax.py](./examples/python/fax.py)      |      [letter.py](./examples/python/letter.py)      |      [invoice.py](./examples/python/invoice.py)      |      [gmbh.py](./examples/python/gmbh.py)      |
| **TypeScript (viem)** |    [fax.ts](./examples/typescript/fax.ts)    |    [letter.ts](./examples/typescript/letter.ts)    |    [invoice.ts](./examples/typescript/invoice.ts)    |    [gmbh.ts](./examples/typescript/gmbh.ts)    |
| **LangChain**         |    [fax.py](./examples/langchain/fax.py)     |    [letter.py](./examples/langchain/letter.py)     |    [invoice.py](./examples/langchain/invoice.py)     |    [gmbh.py](./examples/langchain/gmbh.py)     |
| **Claude Tool Use**   | [fax.py](./examples/claude-tool-use/fax.py)  | [letter.py](./examples/claude-tool-use/letter.py)  | [invoice.py](./examples/claude-tool-use/invoice.py)  | [gmbh.py](./examples/claude-tool-use/gmbh.py)  |
| **OpenAI Responses**  | [fax.py](./examples/openai-responses/fax.py) | [letter.py](./examples/openai-responses/letter.py) | [invoice.py](./examples/openai-responses/invoice.py) | [gmbh.py](./examples/openai-responses/gmbh.py) |

### How to Run the Examples

1. **Navigate to the examples directory**:
   ```bash
   cd examples
   ```
2. **Configure your environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your PRIVATE_KEY (Base network) and RPC_URL
   ```
3. **Install and Run**:
   - **Python**: `pip install -r <folder>/requirements.txt && python <folder>/<file>.py`
   - **TypeScript**: `cd typescript && npm install && npx ts-node <file>.ts`
   - **Shell**: `bash curl/<file>.sh`

---

## MCP Integration

AgentBureau is **MCP Native**. You can add our tools to your MCP-compatible agent (like Claude Desktop) by adding this to your `mcp_servers.yaml`:

```yaml
mcpServers:
  agent-bureau:
    command: npx
    args:
      [
        '-y',
        '@modelcontextprotocol/server-http',
        'https://agentbureau-api.datafortress.cloud/mcp',
      ]
```

_Note: For the best experience, use the SSE transport directly if your client supports it._

---

## Website Development

This repository contains the source code for the [agentbureau.de](https://agentbureau.de) website and documentation.

### Tech Stack

- **Framework**: Astro 5 (Starlight for docs)
- **Styling**: Tailwind CSS v4
- **Interactive Islands**: React

### Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start development server**:
   ```bash
   npm run dev
   ```
3. **Build for production**:
   ```bash
   npm run build
   ```

## Documentation

Full documentation, including legal frameworks (ZAG exemption, Störerhaftung), detailed API references, and agent-specific integration guides, is available at [/docs](https://agentbureau.de/docs).

---

## Marketing & Community

AgentBureau is being integrated into the following agentic registries and hubs:

- **MCP Registries**: [Smithery](https://smithery.ai/), [Glama](https://glama.ai/mcp), [Awesome-MCP](https://github.com/punkpeye/awesome-mcp)
- **Agent Ecosystems**: [LangChain Hub](https://smith.langchain.com/hub), [CrewAI Tools](https://docs.crewai.com/core-concepts/Tools/)
- **Agentic Economy**: [Coinbase Developer Platform](https://www.coinbase.com/developer-platform), [Base Ecosystem](https://warpcast.com/~/channel/base)
