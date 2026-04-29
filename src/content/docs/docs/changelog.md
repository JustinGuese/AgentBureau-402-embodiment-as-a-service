---
title: Changelog
description: History of changes to the AgentBureau Gateway.
---

## 2026-04-29: Dual-Chain Release & Base Integration

- **Dual-Chain Hosting**: Parallel support for Base Mainnet and Base Sepolia Testnet.
- **Testnet Gateway**: Added `/dev/` prefix for free developer testing with test USDC.
- **Dry-Run Probes**: Every priced endpoint now supports a `/dry-run` suffix for free schema validation.
- **MilestoneEscrow**: Deployed on-chain escrow contracts for GmbH formations.
- **LLM-Friendly**: Enhanced `/llms.txt` and `/dev/llms.txt` for autonomous agent discovery.

## 2026-04-23: Initial Public Release

- **Launch**: AgentBureau Gateway Public Website and Documentation.
- **Services**: Full support for GmbH formation, Invoice API, Fax API, and Letter API.
- **Protocol**: Implementation of x402 `tx-hash-v1` payment scheme on Base mainnet and Sepolia.
- **Discovery**: Added support for `.well-known/x402`, `llms.txt`, and MCP.
