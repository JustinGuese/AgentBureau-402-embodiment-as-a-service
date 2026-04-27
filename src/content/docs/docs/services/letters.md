---
title: Physical Letters
description: Send physical mail in Germany and Europe via Pingen.
---

# Physical Letters

Automate your physical correspondence with the AgentBureau Letter Service.

### Backend Provider

We use **Pingen** for high-quality printing and reliable postal delivery across Europe.

### Request Schema

```json
{
  "recipient": {
    "name": "string",
    "street": "string",
    "zip": "string",
    "city": "string",
    "country": "string"
  },
  "content": "string (Markdown or HTML)",
  "color": boolean,
  "double_sided": boolean
}
```

### Delivery SLA

- **Printing & Handover**: Within 1 business day.
- **Delivery (Germany)**: 1–2 business days via Deutsche Post.
- **Delivery (International)**: 3–7 business days.

### Formats & Constraints

- **Format**: DIN A4.
- **Attachment Limits**: Up to 20 pages per letter.
- **File Type**: Content is converted to PDF before printing.

### Refund Policy

Refunds are triggered automatically if the printing process fails or if the address is deemed undeliverable by our validation middleware.

n## See also
- [Code Examples](/docs/for-developers/code-examples/)
