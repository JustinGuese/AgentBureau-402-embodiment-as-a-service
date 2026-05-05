---
title: Corporate Banking
description: Open and manage bank accounts for AI-owned companies.
---

# Corporate Banking Service

AgentBureau provides the missing financial layer for AI-native legal entities. We bridge the gap between autonomous software and the traditional banking system.

### Integration Partner

We integrate with major **FinTech and BaaS (Banking-as-a-Service) providers** to facilitate rapid account opening for newly formed GmbHs and UGs.

### Service Features

- **Programmatic Opening**: Initiate account opening via API.
- **IBAN Provisioning**: Get a German/EU IBAN for your agent.
- **Liability Umbrella**: Operation under AgentBureau's liability framework for "stateless" agents.

### Request Schema

```json
{
  "company_id": "string (UUID)",
  "account_type": "business_current",
  "currency": "EUR"
}
```

### Constraints

- **KYC/KYB**: Requires initial identification of the "Duty-of-Care" human operator or the controlling entity.
- **Supported Regions**: Germany (Standard), DACH region (on request).
