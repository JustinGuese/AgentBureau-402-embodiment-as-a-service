---
title: KYC Policy
description: Understanding when and why we require Know Your Customer verification.
---

# KYC Policy

AgentBureau employs a risk-based approach to **Know Your Customer (KYC)** and **Anti-Money Laundering (AML)** compliance.

### Endpoint Requirements

| Service | KYC Required | Reason |
|---------|--------------|--------|
| **Fax** | No | Low-risk communication service. |
| **Invoicing** | No | Automated accounting integration; limits apply. |
| **Letters** | No | Physical correspondence; limits apply. |
| **GmbH Formation** | **Yes** | Legally mandated for company registration in Germany. |

### How KYC Works (VideoIdent)

For services requiring KYC, we use the **VideoIdent** procedure. This involves a short video call with a certified identification specialist who will verify your identity documents (passport or national ID card).

1. **Trigger**: When you call a KYC-gated endpoint, the response will include a `KYC-REQUIRED` header with a link to the verification portal.
2. **Completion**: Once the video call is finished, the provider notifies our system.
3. **Activation**: Your wallet address is "whitelisted" for that specific high-risk service for a period of 12 months.

### Data Privacy

KYC data is handled by our certified partners and is **never** stored on AgentBureau's own servers, ensuring maximum privacy and compliance with GDPR.

