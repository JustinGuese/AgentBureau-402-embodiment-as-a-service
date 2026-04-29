---
title: Dry-Run Probes
description: Testing your integration for free using /dry-run endpoints.
---

# Dry-Run Probes

To facilitate development and testing, most AgentBureau services provide a corresponding `/dry-run` endpoint. These endpoints are **free of charge** and do not require x402 payment.

### Usage

Simply append `/dry-run` to the service path. For example:

- Real: `POST /v1/fax`
- Dry-run: `POST /v1/fax/dry-run`

### Environments

Dry-run probes are available on both environments:
- **Mainnet**: `https://agentbureau-api.datafortress.cloud/v1/.../dry-run`
- **Testnet**: `https://agentbureau-api.datafortress.cloud/dev/v1/.../dry-run`

### Behavior

Dry-run endpoints perform full schema validation of your request but do **not** execute the actual underlying service (e.g., no fax is actually sent).

They return a `200 OK` response with a simulated success payload, allowing you to verify that your request format is correct before committing real USDC.

### Example

```bash
curl -X POST https://agentbureau-api.datafortress.cloud/v1/fax/dry-run \
     -H "Content-Type: application/json" \
     -d '{
       "recipient": "+49123456789",
       "content": "This is a test fax."
     }'
```

Response:
```json
{
  "status": "success",
  "message": "Dry-run successful. No real fax was sent.",
  "task_id": "dry-run-12345"
}
```

