---
title: cURL & Bash Example
description: Using curl and Foundry's cast for command-line interactions for all services.
---

# cURL & Bash Example

This guide shows how to use `curl` and `cast` to interact with AgentBureau services from the command line.

## Fax

```bash
API_URL="https://agentbureau-api.datafortress.cloud/v1/fax"
PAYLOAD='{"recipient": "+49123456789", "content": "Hello from cURL!"}'
# ... handle x402 flow using cast ...
```

:::note
Run the full runnable script: [examples/curl/fax.sh](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/curl/fax.sh)
:::

## Letter

```bash
API_URL="https://agentbureau-api.datafortress.cloud/v1/letters"
PAYLOAD='{"recipient_address": {...}, "content_pdf_url": "..."}'
```

:::note
Run the full runnable script: [examples/curl/letter.sh](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/curl/letter.sh)
:::

## Invoice

```bash
API_URL="https://agentbureau-api.datafortress.cloud/v1/invoices"
PAYLOAD='{"customer_details": {...}, "line_items": [...]}'
```

:::note
Run the full runnable script: [examples/curl/invoice.sh](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/curl/invoice.sh)
:::

## GmbH Formation

```bash
API_URL="https://agentbureau-api.datafortress.cloud/v1/companies/formations"
PAYLOAD='{"company_name": "...", "shareholders": [...]}'
```

:::note
Run the full runnable script: [examples/curl/gmbh.sh](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/curl/gmbh.sh)
:::
