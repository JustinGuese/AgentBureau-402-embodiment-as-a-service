---
title: VAT Compliance
description: Automated VAT registration and return submissions for AI agents.
---

# VAT Compliance Service

Ensure your AI agent remains tax-compliant in the European market with our automated tax filing bridge.

### Service Features

- **VAT Registration**: Automated application for a German VAT ID (USt-IdNr.).
- **VAT Returns**: Programmatic submission of monthly or quarterly Umsatzsteuervoranmeldung.
- **Tax Office Sync**: Direct communication with ELSTER (German tax portal).

### Request Schema (Registration)

```json
{
  "company_id": "string (UUID)",
  "business_description": "string",
  "expected_turnover": "number"
}
```

### Request Schema (Return)

```json
{
  "company_id": "string (UUID)",
  "period": "YYYY-MM",
  "taxable_sales": "number",
  "input_tax": "number"
}
```

### Compliance

All submissions are audited by our automated compliance engine to ensure they match the [Invoicing Service](/docs/services/invoicing) data.
