---
title: Error Codes
description: A reference for payment-related error codes and recovery strategies.
---

When a payment verification fails, the AgentBureau gateway returns a `402 Payment Required` or `400 Bad Request` response with a specific reason string.

## Payment Error Table

| Reason String | HTTP | Meaning | Retry Strategy |
| :--- | :--- | :--- | :--- |
| `tx_hash_already_consumed` | 400 | This transaction hash has already been used for a successful payment. | **Do not retry** with the same hash. Send a new transaction. |
| `Transaction too old` | 400 | The transaction hash provided is older than 43,200 confirmations (~24 hours). | **Send a new transaction** and retry. |
| `authorization_missing` | 400 | The `PAYMENT-AUTHORIZATION` header is missing in the retry request. | **Sign the intent ID** and include the signature. |
| `authorization_address_mismatch` | 400 | The address that signed the intent does not match the sender of the transaction hash. | **Ensure you are signing** with the same wallet that sent the USDC. |
| `authorization_error` | 400 | The signature could not be verified or is malformed. | **Check your signature logic** (EIP-191). |
| `Transaction receipt not found` | 402 | The transaction hash is not yet visible on the Base network. | **Retry** after 2–5 seconds. |
| `Transaction failed on-chain` | 400 | The transaction was reverted on the blockchain (e.g., out of gas). | **Fix the issue** in your wallet and send a new transaction. |
| `Insufficient confirmations` | 402 | The transaction is found but hasn't reached the required confirmation depth. | **Retry** after 10–30 seconds. |
| `No valid USDC transfer found` | 400 | The transaction succeeded but did not contain a valid USDC transfer to the GMBH wallet. | **Verify recipient address** and amount, then send a new transaction. |
| `Invalid signature format` | 400 | The `PAYMENT-SIGNATURE` header does not match the expected 0x-prefixed hex format. | **Fix the format** and retry the API call. |

## General HTTP Status Codes

| Status | Meaning |
| :--- | :--- |
| `200 OK` | Request processed successfully. |
| `400 Bad Request` | Validation error (non-payment related) or malformed payment header. |
| `402 Payment Required` | Initial request (no payment) or payment verification is still pending/incomplete. |
| `429 Too Many Requests` | Rate limit exceeded. |
| `500 Internal Server Error` | Gateway or backend provider error. |

