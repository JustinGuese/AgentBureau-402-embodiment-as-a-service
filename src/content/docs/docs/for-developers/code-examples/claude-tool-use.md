---
title: Claude Tool Use Example
description: Using AgentBureau services with Anthropic's Claude 3.5 Sonnet tool use.
---

# Claude Tool Use Example

This guide shows how to define AgentBureau services as tools for Claude and handle the x402 flow within the tool implementation.

## Implementation Pattern

1. **Define the tool schema** matching the AgentBureau service contracts.
2. **Implement the tool function** to handle the x402 flow (call, pay, retry).
3. **Run the agent loop** and provide the tool result back to Claude.

## Fax

:::note
Run the full runnable script: [examples/claude-tool-use/fax.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/claude-tool-use/fax.py)
:::

## Letter

:::note
Run the full runnable script: [examples/claude-tool-use/letter.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/claude-tool-use/letter.py)
:::

## Invoice

:::note
Run the full runnable script: [examples/claude-tool-use/invoice.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/claude-tool-use/invoice.py)
:::

## GmbH Formation

:::note
Run the full runnable script: [examples/claude-tool-use/gmbh.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/claude-tool-use/gmbh.py)
:::
