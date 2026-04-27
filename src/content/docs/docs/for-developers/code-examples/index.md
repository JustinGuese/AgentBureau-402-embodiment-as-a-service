---
title: Code Examples Matrix
description: A 6x4 matrix of runnable AgentBureau integration scripts.
---

# Code Examples Matrix

We provide a comprehensive **6×4 matrix of runnable scripts** demonstrating how to integrate AgentBureau services across various languages and frameworks. These examples handle the full x402 flow: **Challenge → Payment → Retry**.

| Client | [Fax](/docs/services/fax) | [Letter](/docs/services/letters) | [Invoice](/docs/services/invoicing) | [GmbH](/docs/services/company-formation) |
| :--- | :---: | :---: | :---: | :---: |
| **[cURL / Bash](./curl)** | [fax.sh](./curl/#fax) | [letter.sh](./curl/#letter) | [invoice.sh](./curl/#invoice) | [gmbh.sh](./curl/#gmbh-formation) |
| **[Python](./python)** | [fax.py](./python/#fax) | [letter.py](./python/#letter) | [invoice.py](./python/#invoice) | [gmbh.py](./python/#gmbh-formation) |
| **[TypeScript](./typescript)** | [fax.ts](./typescript/#fax) | [letter.ts](./typescript/#letter) | [invoice.ts](./typescript/#invoice) | [gmbh.ts](./typescript/#gmbh-formation) |
| **[LangChain](./langchain)** | [fax.py](./langchain/#fax) | [letter.py](./langchain/#letter) | [invoice.py](./langchain/#invoice) | [gmbh.py](./langchain/#gmbh-formation) |
| **[Claude](./claude-tool-use)** | [fax.py](./claude-tool-use/#fax) | [letter.py](./claude-tool-use/#letter) | [invoice.py](./claude-tool-use/#invoice) | [gmbh.py](./claude-tool-use/#gmbh-formation) |
| **[OpenAI](./openai-responses)** | [fax.py](./openai-responses/#fax) | [letter.py](./openai-responses/#letter) | [invoice.py](./openai-responses/#invoice) | [gmbh.py](./openai-responses/#gmbh-formation) |

## GitHub Repository

All examples are hosted in the `/examples` directory of our [GitHub repository](https://github.com/JustinGuese/website-openclawgatewaycompanyapi). You can clone the entire set to get started immediately:

```bash
git clone https://github.com/JustinGuese/website-openclawgatewaycompanyapi.git
cd website-openclawgatewaycompanyapi/examples
```

### Running Locally

1. **Configure your environment**: Copy `examples/.env.example` to `examples/.env` and provide your `PRIVATE_KEY` and `RPC_URL`.
2. **Install dependencies**: Each subdirectory contains its own `requirements.txt` or `package.json`.
3. **Execute**: See the language-specific guides for detailed run commands.

[View all examples on GitHub](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/tree/main/examples)

