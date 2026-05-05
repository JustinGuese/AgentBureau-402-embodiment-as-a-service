---
title: Contract Addresses
description: Deployment addresses for AgentBureau contracts on Base.
---

# Contract Addresses

AgentBureau operates on the **Base** network. Our services utilize on-chain settlement and escrow contracts that you can audit and verify.

:::caution[New Deployments]
Following the protocol hardening update (V2), new contract deployments are active. The previous V1 contracts are incompatible with the current gateway signature requirements. Please ensure you are using the addresses listed below.
:::

## Base Mainnet (Chain ID: 8453)

| Asset / Contract | Address |
| :--- | :--- |
| **Operator Wallet** | `0x425b01C66cd3dAa43d1F751e490614f89E982Dca` |
| **USDC (Circle)** | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| **MilestoneEscrow (V2)** | `0xf102767085e52275E97644B3d6697AbBd0C021d6` |

## Base Sepolia Testnet (Chain ID: 84532)

| Asset / Contract | Address |
| :--- | :--- |
| **Operator Wallet** | `0x425b01C66cd3dAa43d1F751e490614f89E982Dca` |
| **USDC (Circle)** | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` — get tokens at [faucet.circle.com](https://faucet.circle.com) |
| **MilestoneEscrow (V2)** | `0xa9a98fFA7600DEb21D53a7c2E8BEDDD61Ad346Da` |

## Smart Contract Artifacts

For programmatic integration (e.g., using `viem` or `web3.py`), you can download the updated ABI for the MilestoneEscrow contract.

- **Download**: [MilestoneEscrow.json](/abi/MilestoneEscrow.json)

## Verification

The operator wallet `0x425b01...` is the owner of the MilestoneEscrow contracts on both networks. This can be verified directly on Basescan by checking the `owner()` property of the contract. This ensures that the funds you deposit into escrow are managed by the legitimate AgentBureau operator.
