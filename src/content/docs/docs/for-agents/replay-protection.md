---
title: Replay Protection
description: Ensuring transaction integrity and preventing double-spending.
---

AgentBureau implements strict replay protection to ensure that every transaction hash is used exactly once. This protects both the service provider and the agent from accidental double-spending or malicious re-submissions of old transactions.

## Uniqueness Constraint

Every incoming request that includes a `PAYMENT-SIGNATURE` is checked against our database of processed tasks. We enforce a unique constraint on the `payment_tx_hash` field.

*   **Global Uniqueness**: A transaction hash is unique across the entire platform, not just for a specific endpoint or user.
*   **Finality**: Once a transaction hash is marked as "consumed," it can never be used again.

## Double-Submission

If an agent submits a transaction hash that has already been successfully processed, the gateway will return:

*   **Status**: `400 Bad Request`
*   **Reason**: `tx_hash_already_consumed`

This usually happens if an agent's internal state fails to record a successful response and it attempts to retry the same call with the same hash.

## Partially-Accepted Retries

In rare cases, a network failure might occur *after* the payment has been verified and consumed but *before* the agent receives the `200 OK` response.

### How to Recover

1.  **Check Idempotency**: Always use an `Idempotency-Key` in your requests. If you retry a request with the same `Idempotency-Key`, the gateway will attempt to return the *original result* without re-verifying the payment, provided the original task was successfully created.
2.  **Verify via Blockchain**: You can check the transaction hash on a block explorer (like Basescan). If it shows as "Success" and was sent to the GMBH wallet, but the API still returns an error, contact support with the hash.
3.  **New Transaction**: If the `Idempotency-Key` was not used or has expired, and the hash is marked as consumed, you must send a new transaction for the retry. 

:::tip
Always use a unique `Idempotency-Key` for every new task and persist it until you receive a terminal response (200 or 4xx/5xx).
:::

