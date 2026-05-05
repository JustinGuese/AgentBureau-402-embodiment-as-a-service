---
title: Python Example
description: A complete Python client using httpx and web3.py for all AgentBureau services.
slug: docs/for-developers/python
---

# Python Example

This guide demonstrates how to integrate with all AgentBureau services using Python. Each example handles the full x402 payment flow.

## Common Pattern

All scripts follow the updated 4-step x402 pattern:
1. **Call** the endpoint with `Idempotency-Key`.
2. **Handle 402** by parsing `PAYMENT-REQUIRED` and `X-PAYMENT-INTENT-ID`.
3. **Pay** by sending USDC on Base.
4. **Sign** the intent ID: `AgentBureau Intent: {intent_id}`.
5. **Retry** with `PAYMENT-SIGNATURE` (hash) and `PAYMENT-AUTHORIZATION` (signature).

## Fax

Sends a digital fax to a German number.

```python
# Short snippet of the payload and endpoint
API_URL = "https://agentbureau-api.datafortress.cloud/v1/fax"
payload = {
    "recipient_number": "+49123456789",
    "content": "Hello from Python!"
}
# ... handle x402 flow ...
```

:::note
Run the full runnable script: [examples/python/fax.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/python/fax.py)  
Fetch raw: `https://raw.githubusercontent.com/JustinGuese/website-openclawgatewaycompanyapi/main/examples/python/fax.py`
:::

## Letter

Sends a physical letter to a German address.

```python
API_URL = "https://agentbureau-api.datafortress.cloud/v1/letters"
payload = {
    "recipient_address": {
        "name": "Finanzamt Berlin",
        "street": "Musterstraße 1",
        "zip": "10115",
        "city": "Berlin",
        "country": "Germany"
    },
    "content_pdf_url": "https://example.com/letter.pdf"
}
# ... handle x402 flow ...
```

:::note
Run the full runnable script: [examples/python/letter.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/python/letter.py)
:::

## Invoice

Generates a professional invoice via Lexoffice.

```python
API_URL = "https://agentbureau-api.datafortress.cloud/v1/invoices"
payload = {
    "customer_details": {
        "name": "Acme Corp",
        "email": "billing@acme.com",
        "address": "123 Business Way, London, UK"
    },
    "line_items": [{"description": "AI Consulting", "quantity": 10, "unit_price": 150.00}]
}
# ... handle x402 flow ...
```

:::note
Run the full runnable script: [examples/python/invoice.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/python/invoice.py)
:::

## GmbH Formation

Initiates the German GmbH formation process.

```python
API_URL = "https://agentbureau-api.datafortress.cloud/v1/companies/formations"
payload = {
    "company_name": "Autonomous Ventures GmbH",
    "shareholders": [{"name": "Alice Agent", "shares": 25000, "address": "Digital Ether 0x123"}]
}
# ... handle x402 flow ...
```

:::note
Run the full runnable script: [examples/python/gmbh.py](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/python/gmbh.py)
:::
