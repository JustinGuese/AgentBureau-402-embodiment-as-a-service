---
title: Funding Your Wallet on Base
description: How to get USDC and ETH on Base from Ethereum mainnet, Coinbase, or another L2 so the x402 playground works.
---

The AgentBureau API charges in **USDC on Base** (Chain ID `8453` mainnet, `84532` Sepolia testnet). USDC on Ethereum L1, Polygon, Arbitrum, Optimism, or sitting on a CEX **does not count** — the smart contract on Base cannot see balances on other chains. If your transfer reverts with `ERC20: transfer amount exceeds balance`, that is almost always why.

You need two things on Base:

1. **At least the USDC fee** for the endpoint (e.g. 1 USDC for `/v1/fax`).
2. **A small amount of ETH for gas** — ~$0.50 is plenty for ~50 transactions; a USDC transfer on Base costs less than $0.01.

## Easiest: withdraw from Coinbase

If you hold USDC on Coinbase, withdraw it directly to Base — it's free and instant.

1. Coinbase → **Send/Receive** → **Send** USDC.
2. Paste your wallet address.
3. **Network: select "Base"** (not "Ethereum"). This is the critical step.
4. Send.
5. Repeat for a tiny amount of ETH (also pick "Base" as the network).

## From Ethereum L1

Use the official Base bridge: <https://bridge.base.org>.

1. Connect the wallet that holds your USDC/ETH.
2. Bridge `Ethereum → Base`.
3. Pick the asset (USDC or ETH), amount, and confirm. Costs L1 gas (~$2–5) and takes ~10 minutes.

The bridged USDC arrives as **native USDC** at `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` — the same contract the API expects.

> **Watch out for `USDbC`.** Base also has a legacy bridged token called USDbC at `0xd9aaEc86B65D86f6A7B5B1b0c42FFA531710b6Ca`. It is **not** the same asset. The API only accepts native USDC.

## From another L2 (Arbitrum, Optimism, Polygon, …)

Cross-rollup bridges are faster than going via L1:

- <https://app.across.to> — fast, cheap, supports USDC and ETH.
- <https://www.relay.link> — similar.
- <https://app.squidrouter.com> — broader chain coverage.

Pick your source chain → destination "Base" → asset → confirm.

## Testnet (Base Sepolia)

For the playground's testnet mode, use the Circle faucet:

- USDC: <https://faucet.circle.com> (pick "Base Sepolia").
- Sepolia ETH for gas: <https://www.alchemy.com/faucets/base-sepolia> or <https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet>.

## Verify your balance

Before retrying the playground, confirm the funds landed:

```
https://basescan.org/token/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913?a=YOUR_ADDRESS
```

If that page shows ≥ 1 USDC for your connected wallet, you're ready to go.
