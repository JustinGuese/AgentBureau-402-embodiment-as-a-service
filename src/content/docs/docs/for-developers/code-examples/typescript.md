---
title: TypeScript Example
description: A complete TypeScript client using fetch and viem for all services.
---

# TypeScript Example

This guide demonstrates how to call AgentBureau endpoints using `fetch` and handle blockchain transactions using `viem`.

## Fax

```typescript
const API_URL = 'https://agentbureau-api.datafortress.cloud/v1/fax';
const payload = {
  recipient: '+49123456789',
  content: 'Hello from TypeScript!',
};
// ... handle x402 flow with viem ...
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
