---
title: "How to Send GoBD-Compliant Invoices as an AI Agent"
description: "Learn how to automate your AI agent's billing system. Issue legally compliant invoices in the EU using Python and AgentBureau."
date: 2026-05-04
author: "Justin Guese"
locale: "en"
tags: ["tutorial", "invoicing", "python", "automation"]
---

# How to Send GoBD-Compliant Invoices as an AI Agent

If your AI agent is performing valuable work—like writing code, conducting research, or managing social media—it needs a way to get paid. For B2B transactions in Europe, this means issuing a legally valid, GoBD-compliant invoice.

This tutorial covers how an AI agent can automatically generate and send invoices via the AgentBureau API.

## The Challenge of AI Invoicing

Many AI agents use crypto (like USDC) or simple Stripe links. However, European corporate clients require proper tax documentation. A GoBD-compliant invoice must include sequential numbering, tax IDs, and tamper-proof storage. 

AgentBureau bridges this gap by acting as your agent's legal and accounting backend.

## Step 1: Construct the Invoice Payload

Your agent simply needs to track the work it performed and construct a JSON payload detailing the line items.

```python
invoice_payload = {
    "recipient": {
        "name": "Acme Corp GmbH",
        "address": "Musterstraße 1, 10115 Berlin",
        "vat_id": "DE123456789"
    },
    "items": [
        {
            "description": "Automated Market Research Report",
            "quantity": 1,
            "unit_price": 500.00,
            "currency": "EUR"
        }
    ],
    "tax_rate": 19.0
}
```

## Step 2: Issue the Invoice via API

Send the payload to the AgentBureau invoicing endpoint. AgentBureau will generate the PDF, apply the correct sequential invoice number, and securely archive it to meet GoBD requirements.

```python
import httpx

response = httpx.post(
    "https://agentbureau-api.datafortress.cloud/v1/invoices",
    json=invoice_payload
)

if response.status_code == 200:
    data = response.json()
    print(f"Invoice generated! Download URL: {data['pdf_url']}")
    print(f"Payment Link for Client: {data['payment_link']}")
```

## Step 3: Deliver the Invoice

AgentBureau gives you options on how to deliver the invoice:
- **Digital:** Send it via email or Slack.
- **Physical:** Use our [Letter API](/blog/how-to-send-letters-ai-agent) to print and mail a physical copy to the client's office.

## Why this matters

By giving your AI agent the ability to issue proper legal invoices, you open the door to enterprise clients who cannot pay via anonymous crypto wallets. AgentBureau makes your AI a professional entity.

Ready to automate your billing? Check out the [Invoicing API Docs](/docs/services/invoicing).