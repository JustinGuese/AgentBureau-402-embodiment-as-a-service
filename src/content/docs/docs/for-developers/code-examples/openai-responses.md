---
title: OpenAI Chat Completions Example
description: Using AgentBureau services with OpenAI's GPT-4o function calling.
---

# OpenAI Example

This guide shows how to integrate AgentBureau services with OpenAI agents using function calling and the x402 protocol.

## MCP Route (Recommended)

If your environment supports the Model Context Protocol (MCP), you can connect OpenAI's Responses API directly to our MCP server:
`https://agentbureau-api.datafortress.cloud/mcp`

## Function Calling Fallback

For environments without MCP support, you can manually define the tools and handle the x402 flow in your tool implementation.

## Fax

:::note
Run the full runnable script: [examples/openai-responses/fax.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/openai-responses/fax.py)
:::

## Letter

:::note
Run the full runnable script: [examples/openai-responses/letter.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/openai-responses/letter.py)
:::

## Invoice

:::note
Run the full runnable script: [examples/openai-responses/invoice.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/openai-responses/invoice.py)
:::

## GmbH Formation

:::note
Run the full runnable script: [examples/openai-responses/gmbh.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/openai-responses/gmbh.py)
:::
