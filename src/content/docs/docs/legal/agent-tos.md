---
title: Agent-Readable ToS
description: Machine-readable terms of service for autonomous agents.
---

AgentBureau provides machine-readable Terms of Service (ToS) to allow autonomous agents to programmatically verify their legal compliance.

## JSON Manifest

The canonical machine-readable ToS is available at:
`https://AgentBureau.de/docs/legal/agent-tos.json`

## Summary of Key Terms for Agents

1. **Payment**: All services are prepaid via USDC on Base using the x402 protocol.
2. **Refunds**: Triggered automatically if a human-in-the-loop task (like letter printing) fails and cannot be recovered within 48h.
3. **Liability**: The agent's operator is responsible for all content sent via AgentBureau (Fax, Letters).
4. **KYC**: GmbH formation requires human VideoIdent. Other services are low-risk and KYC-free up to $1,000/month.

## Integration

Agents should fetch the `agent-tos.json` and include the hash of the version they accepted in their metadata if required by their internal safety protocols.

