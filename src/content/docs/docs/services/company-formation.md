---
title: GmbH Company Formation
description: The full workflow for forming a German GmbH remotely.
---

# GmbH Company Formation

AgentBureau enables the autonomous formation of a German GmbH (Limited Liability Company) through a hybrid digital/HITL workflow. 

:::important[Milestone Escrow]
Unlike our digital-only services, company formation requires the **total amount** (Service Fee + required Stammkapital) to be deposited into our audited **MilestoneEscrow** contract upfront. This contract is open-source and deployed on Base; it ensures that your funds are only released as milestones are achieved and verified.

**Security & Trust Model:**
- **Operator Signature**: Deposits now require an `X-OPERATOR-SIGNATURE` returned in the 402 response. This is an **anti-grief measure**: it prevents malicious actors from front-running your `intent_id` with a 0-USDC deposit to block your formation. It ensures only intents registered by the AgentBureau gateway can interact with the escrow contract.
- **Trust Assumption**: While the signature protects against third-party griefing, the agent still trusts the AgentBureau operator (who holds the signing key) to accurately register the intent.
- **Griefing Fee**: A fee (currently **100 USDC**) is charged if a formation is cancelled after significant work has begun. This value is mutable and owner-adjustable to reflect current operational costs.
- **Trustlessness & Timelock**: To prevent "rug-pull" risks, the contract includes a **3-day timelock** for any changes to the appointed Arbiter. This gives you time to withdraw or dispute if you do not trust a new arbiter.
- **No Nonce**: Nonces are no longer required for dispute resolutions, making the settlement process more robust.

See the [Contract Addresses](/docs/reference/contract-addresses/) for deployment details.
:::

### The Formation Flow & Milestones

The formation process is divided into three major milestones. Although 100% of the funds are deposited upfront, they are released from escrow according to this schedule:

1.  **M1: Initial Submission & KYC (20% Release)**
    *   Submission of company details.
    *   KYC/AML verification for all shareholders and directors.
    *   Business name check with IHK.
2.  **M2: Notary Appointment & Registration (50% Release)**
    *   Remote notary appointment via video conference.
    *   Signing of the foundation documents.
    *   Submission to the Commercial Register (Handelsregister).
3.  **M3: Finalization & Bank Setup (30% Release)**
    *   Opening of the company bank account.
    *   Deposit of the share capital (Stammkapital) from escrow into the new account.
    *   Receipt of the registration number (HRB).

### Human in the Loop (HITL) Steps

Unlike our purely digital services, company formation involves several human-mediated steps:
- **Review**: A legal specialist reviews your submission for completeness and naming conflicts.
- **Coordination**: An operator coordinates with the notary and the bank.
- **Escrow**: We can act as an escrow agent for the share capital if required.

### Timeline

- **Preparation**: 2–5 business days.
- **Notary Appointment**: 1–2 weeks (depending on availability).
- **Registration**: 2–4 weeks (depending on the local court).

### Requirements

- Valid passport for all involved parties.
- Proof of address.
- Clear business purpose (Gegenstand des Unternehmens).

n## See also
- [Code Examples](/docs/for-developers/code-examples/)
