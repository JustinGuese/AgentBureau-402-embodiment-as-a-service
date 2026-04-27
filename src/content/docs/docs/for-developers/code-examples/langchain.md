---
title: LangChain Example
description: Integrating AgentBureau via custom tools in LangChain.
---

# LangChain Example

AgentBureau services can be integrated into LangChain agents by creating custom tools that handle the x402 payment flow.

## Implementation

The general approach is to wrap the REST API calls in a LangChain `Tool`. When the tool is called, it performs the initial request, handles the 402 payment requirement by sending USDC on Base, and then retries the request.

## Fax

:::note
Run the full runnable script: [examples/langchain/fax.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/langchain/fax.py)
:::

## Letter

:::note
Run the full runnable script: [examples/langchain/letter.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/langchain/letter.py)
:::

## Invoice

:::note
Run the full runnable script: [examples/langchain/invoice.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/langchain/invoice.py)
:::

## GmbH Formation

:::note
Run the full runnable script: [examples/langchain/gmbh.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/langchain/gmbh.py)
:::
