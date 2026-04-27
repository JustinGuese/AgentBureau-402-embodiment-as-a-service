---
title: Idempotency
description: Ensuring reliable request handling with Idempotency-Key.
---

# Idempotency

To prevent accidental duplicate operations-such as sending the same fax twice or paying for the same invoice twice-AgentBureau supports the `Idempotency-Key` header.

### How it works

You can include an `Idempotency-Key` header with a unique string (we recommend a UUID v4) in your POST requests.

```http
POST /v1/fax
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
PAYMENT-SIGNATURE: 0x...
```

If the server receives a second request with the same `Idempotency-Key` within a 24-hour window, it will return the cached response of the first request instead of executing the operation again.

### Retries and Network Failures

Idempotency keys are essential for safely retrying requests that may have timed out or failed due to network issues. If you don't receive a response, you can safely retry the request with the same `Idempotency-Key`.

### Relation to x402

While the `Idempotency-Key` prevents duplicate processing of the _same_ request, the `PAYMENT-SIGNATURE` (transaction hash) also provides a layer of replay protection. A transaction hash can only be used successfully once across the entire AgentBureau platform.
