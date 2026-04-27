---
title: tx-hash-v1 Scheme
description: Technical specification for the transaction hash verification model.
---

The `tx-hash-v1` scheme is the primary payment verification model used by AgentBureau. Unlike models that require signed authorizations (like EIP-3009), `tx-hash-v1` relies on the agent performing a standard on-chain transfer and providing the transaction hash for verification.

## Verification Model

1. **Agent Action**: The agent sends a standard USDC `transfer(to, amount)` transaction on the Base network to the AgentBureau GMBH wallet.
2. **Gateway Submission**: The agent retries the API call, including the resulting transaction hash in the `PAYMENT-SIGNATURE` header.
3. **Gateway Verification**: AgentBureau verifies the transaction on the blockchain before processing the request.

### `PAYMENT-SIGNATURE` Format

The `PAYMENT-SIGNATURE` header must be the transaction hash in the following format:
*   `0x` followed by 64 lowercase hexadecimal characters.
*   Total length: 66 characters.
*   Example: `0x5c5064506c748c1a84c8a8d052d9a6c71a3c71a5c71a5c71a5c71a5c71a5c71a`

## On-Chain Checks

When a transaction hash is submitted, our verifier performs the following checks:

| Check | Requirement |
| :--- | :--- |
| **Asset** | Must be a `Transfer` event on the official USDC contract address on Base. |
| **Recipient** | The `to` address in the event must match the GMBH wallet address. |
| **Amount** | The `value` (in atomic units) must be greater than or equal to the `amount_raw` requested in the 402 response. |
| **Status** | The transaction `status` must be `1` (Success). |
| **Confirmations** | The transaction must have at least the required number of confirmations. |

### Confirmation Requirements

To ensure finality, we require a minimum number of confirmations:
*   **Base Mainnet**: 3 confirmations.
*   **Base Sepolia**: 1 confirmation.

You can find the live value for your current environment at `/.well-known/x402`.

## Replay Protection

Transaction hashes are **single-use**. Once a transaction hash has been successfully used to pay for a request, any subsequent attempts to use the same hash (even for different endpoints) will be rejected with a `tx_hash_already_consumed` error.

## Implementation Examples

### Python (web3.py)

```python
from web3 import Web3

# 1. Send the transaction
# (Assuming you have a configured account and USDC contract instance)
tx_hash = usdc_contract.functions.transfer(
    GMBH_WALLET_ADDRESS, 
    amount_atomic
).transact({'from': my_address})

# 2. Wait for confirmation
w3.eth.wait_for_transaction_receipt(tx_hash)

# 3. Call the API
response = requests.post(
    "https://agentbureau-api.datafortress.cloud/v1/fax",
    headers={"PAYMENT-SIGNATURE": tx_hash.hex()},
    json=payload
)
```

### TypeScript (viem)

```typescript
import { createWalletClient, http } from 'viem'
import { base } from 'viem/chains'

const hash = await walletClient.writeContract({
  address: USDC_ADDRESS,
  abi: usdcAbi,
  functionName: 'transfer',
  args: [GMBH_WALLET_ADDRESS, amountAtomic],
})

// Wait for the transaction to be processed
const receipt = await publicClient.waitForTransactionReceipt({ hash })

// Use the hash in the API call
const response = await fetch("https://agentbureau-api.datafortress.cloud/v1/fax", {
  method: "POST",
  headers: {
    "PAYMENT-SIGNATURE": hash,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
})
```

## Common Failure Modes

| Reason String | Meaning | Resolution |
| :--- | :--- | :--- |
| `tx_hash_already_consumed` | This hash was already used for a payment. | Send a new transaction for this request. |
| `Transaction receipt not found` | The transaction hasn't been indexed or doesn't exist. | Ensure the hash is correct and the tx is sent to the right network. |
| `Transaction failed on-chain` | The transfer failed (e.g., out of gas). | Check your wallet balance and retry the transfer. |
| `Insufficient confirmations` | The transaction is too fresh. | Wait a few seconds and retry the API call. |
| `No valid USDC transfer found` | The transaction didn't send USDC to the GMBH wallet. | Verify the recipient address and the token being sent. |

