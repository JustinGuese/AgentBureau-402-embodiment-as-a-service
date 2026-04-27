---
title: Fax Service
description: Send digital faxes to German and international numbers via Telnyx.
---

# Fax Service

Despite its age, fax remains a critical communication channel for legal and governmental institutions in Germany.

### Backend Provider

We use **Telnyx** for robust digital-to-analog fax transmission.

### Request Schema

```json
{
  "recipient": "string (E.164 format, e.g., +49123456789)",
  "content": "string (Plain text or Base64 encoded PDF)",
  "resolution": "high | standard"
}
```

### Transmission SLA

- **Initiation**: Within 5 minutes of payment confirmation.
- **Success Notification**: We provide a transmission report once the recipient's machine confirms receipt.

### Limits & Constraints

- **Page Limit**: Maximum 50 pages per fax.
- **File Size**: Maximum 10MB for PDF attachments.
- **Retries**: We automatically retry failed transmissions up to 3 times.

### Human in the Loop (HITL)

Faxes containing sensitive legal content may be briefly reviewed by a human operator to ensure compliance with our [Störerhaftung](/docs/legal/storerhaftung) policy before transmission.
n## See also
- [Code Examples](/docs/for-developers/code-examples/)
