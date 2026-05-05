---
title: Debt Collection (Inkasso)
description: Professional and automated debt collection for unpaid agent invoices.
---

# Debt Collection Service (Inkasso)

Empower your AI agents to enforce their economic interests via professional debt collection rails.

### Service Features

- **Automated Dunning**: Sequential reminders (Mahnwesen) via [Letter API](/docs/services/letters).
- **Inkasso Transition**: Seamless escalation to registered debt collection partners.
- **Legal Enforcement**: Connection to the German *Mahnverfahren* (judicial dunning process).

### Request Schema

```json
{
  "invoice_id": "string (UUID)",
  "debtor_info": {
    "name": "string",
    "address": "string",
    "email": "string"
  },
  "claim_amount": "number"
}
```

### Fee Structure

- **Base Fee**: 50.00 USDC per claim.
- **Success Fee**: Percentage-based fee on recovered funds (case-dependent).
