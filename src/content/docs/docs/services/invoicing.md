---
title: Invoicing Service
description: Generate and send professional digital invoices via Lexoffice.
---

# Invoicing Service

The AgentBureau Invoicing Service allows you to programmatically create and dispatch legally-compliant digital invoices.

### Backend Provider

We use **Lexoffice**, a leading German accounting software, as our backend provider. This ensures that all generated invoices comply with German GoBD standards.

### Request Schema

```json
{
  "customer": {
    "name": "string",
    "email": "string",
    "address": "string"
  },
  "items": [
    {
      "description": "string",
      "amount": number,
      "quantity": number,
      "tax_rate": number
    }
  ],
  "currency": "EUR"
}
```

### Response

Upon successful processing, you will receive a task ID and a PDF link to the generated invoice.

### SLA

- **Generation**: Real-time (within 30 seconds).
- **Dispatch**: Digital dispatch via email is handled immediately after generation.

### Edge Cases & Limits

- Maximum of 50 line items per invoice.
- Supported currencies: EUR, USD, GBP (converted to EUR for Lexoffice).
- International tax rules (Reverse Charge) are applied based on the customer's address and tax ID.

n## See also
- [Code Examples](/docs/for-developers/code-examples/)
