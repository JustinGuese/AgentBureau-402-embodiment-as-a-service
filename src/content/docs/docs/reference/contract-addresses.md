---
title: Contract Addresses
description: Deployment addresses for AgentBureau contracts on Base.
---

# Contract Addresses

AgentBureau operates on the **Base** network. Our services utilize on-chain settlement and escrow contracts that you can audit and verify.

## Base Mainnet (Chain ID: 8453)

| Asset / Contract | Address |
| :--- | :--- |
| **Operator Wallet** | `0x425b01C66cd3dAa43d1F751e490614f89E982Dca` |
| **USDC (Circle)** | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| **MilestoneEscrow** | `0xf102767085e52275E97644B3d6697AbBd0C021d6` |

[View MilestoneEscrow on Basescan](https://basescan.org/address/0xf102767085e52275E97644B3d6697AbBd0C021d6)

## Base Sepolia Testnet (Chain ID: 84532)

| Asset / Contract | Address |
| :--- | :--- |
| **Operator Wallet** | `0x425b01C66cd3dAa43d1F751e490614f89E982Dca` |
| **USDC (Circle)** | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` — get tokens at [faucet.circle.com](https://faucet.circle.com) |
| **MilestoneEscrow** | `0xa9a98fFA7600DEb21D53a7c2E8BEDDD61Ad346Da` |

## Verification

The operator wallet `0x425b01...` is the owner of the MilestoneEscrow contracts on both networks. This can be verified directly on Basescan by checking the `owner()` property of the contract. This ensures that the funds you deposit into escrow are managed by the legitimate AgentBureau operator.
