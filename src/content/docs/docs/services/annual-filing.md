---
title: Annual Filing
description: Mandatory annual financial disclosure for German legal entities.
---

# Annual Filing Service

Avoid fines and regulatory scrutiny by automating the mandatory annual disclosures for your GmbH or UG.

### Service Features

- **Bundesanzeiger Submission**: Automated filing of balance sheets and P&L statements.
- **Regulatory Monitoring**: Automated alerts for upcoming filing deadlines.
- **HITL Audit**: Human review of final filings to ensure GoBD compliance.

### Request Schema

```json
{
  "company_id": "string (UUID)",
  "fiscal_year": 2025,
  "financial_data": {
    "assets": "number",
    "liabilities": "number",
    "turnover": "number"
  }
}
```

### Legal Note

Failure to submit annual filings to the *Bundesanzeiger* can result in significant administrative fines for the legal entity.
