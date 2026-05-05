---
title: TypeScript Example
description: A complete TypeScript client using fetch and viem for all services.
slug: docs/for-developers/typescript
---

# TypeScript Example

This guide demonstrates how to call AgentBureau endpoints using `fetch` and handle blockchain transactions using `viem`. All requests now require the `Idempotency-Key` and `PAYMENT-AUTHORIZATION` headers.

## The Authorization Pattern

Every priced request follows this pattern in TypeScript:

1.  **Challenge**: `POST` with `Idempotency-Key`.
2.  **Payment**: Send USDC to the `receiver` found in `PAYMENT-REQUIRED`.
3.  **Sign**: Sign the `X-PAYMENT-INTENT-ID` with the wallet: `AgentBureau Intent: {intent_id}`.
4.  **Settle**: Retry with `PAYMENT-SIGNATURE` (hash) and `PAYMENT-AUTHORIZATION` (signature).

## Fax

```typescript
const API_URL = 'https://agentbureau-api.datafortress.cloud/v1/fax';
const payload = {
  recipient_number: '+49123456789',
  content: 'Hello from TypeScript!',
};

// Headers for the final retry
const headers = {
  'Content-Type': 'application/json',
  'Idempotency-Key': 'uuid-v4-key',
  'PAYMENT-SIGNATURE': '0x-tx-hash',
  'PAYMENT-AUTHORIZATION': '0x-signature'
};
```

:::note
Run the full runnable script: [examples/typescript/fax.ts](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/typescript/fax.ts)
:::

## Letter

```typescript
const API_URL = 'https://agentbureau-api.datafortress.cloud/v1/letters';
const payload = {
  recipient_address: {
    name: "Finanzamt Berlin",
    street: "Musterstraße 1",
    zip: "10115",
    city: "Berlin",
    country: "Germany"
  },
  content_pdf_url: "https://example.com/letter.pdf"
};
```

:::note
Run the full runnable script: [examples/typescript/letter.ts](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/typescript/letter.ts)
:::

## Invoice

```typescript
const API_URL = 'https://agentbureau-api.datafortress.cloud/v1/invoices';
const payload = {
  customer_details: {
    name: "Acme Corp",
    email: "billing@acme.com",
    address: "123 Business Way, London, UK"
  },
  line_items: [{ description: "AI Consulting", quantity: 10, unit_price: 150.00 }]
};
```

:::note
Run the full runnable script: [examples/typescript/invoice.ts](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/typescript/invoice.ts)
:::

## GmbH Formation

```typescript
const API_URL = 'https://agentbureau-api.datafortress.cloud/v1/companies/formations';
const payload = {
  company_name: "Autonomous Ventures GmbH",
  shareholders: [{ name: "Alice Agent", shares: 25000, address: "Digital Ether 0x123" }]
};
```

:::note
Run the full runnable script: [examples/typescript/gmbh.ts](https://github.com/JustinGuese/website-openclawgatewaycompanyapi/blob/main/examples/typescript/gmbh.ts)
:::
