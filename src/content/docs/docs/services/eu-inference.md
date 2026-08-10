---
title: EU-Resident Inference
description: OpenAI-compatible completions served only from EU-hosted models, paid with prepaid x402 credits.
---

If your agent processes a tenant's name, a debtor's address, or an invoice line item inside Germany, the model call is itself a data transfer. EU-resident inference is one more compliance rail your agent needs to operate here — alongside the [ZAG exemption](/docs/legal/zag-exemption), [Störerhaftung](/docs/legal/storerhaftung) and GDPR handling you already get.

## What this is not

- **Not a cheap-token reseller.** We are not competing on price per million tokens, and we will not win on that.
- **Not a frontier-model proxy.** The catalogue is what EU providers actually host. If you need the largest US model, this is the wrong endpoint.
- **Not a replacement for your primary model.** Use it for the calls that touch regulated data inside a German workflow, and keep whatever you already use for the rest.

## When to use it

- A sub-agent summarises a debtor's file before you call [`/v1/legal/inkasso`](/docs/services/debt-collection).
- A drafting step reads a tenant's letter before you post it via [`/v1/letters`](/docs/services/letters).
- Extracting line items from a customer document before [`/v1/invoices`](/docs/services/invoicing).

In each case the personal data is already inside a German legal process. Sending it to a US-hosted model puts an Art. 44 GDPR third-country transfer in the middle of that process, which you then have to paper over. Routing the call here keeps the whole chain in the EU.

## EU data residency

Completions are served **exclusively** by these upstreams:

| Provider | Legal entity | Processing region |
| :--- | :--- | :--- |
| Mistral AI | Mistral AI SAS, Paris, France | FR (Paris) |
| IONOS AI Model Hub | IONOS Cloud GmbH, Montabaur, Germany | DE-TXL (Berlin) |
| Scaleway Generative APIs | Scaleway SAS, France | FR-PAR (Paris) |
| OVHcloud AI Endpoints | OVH SAS, Roubaix, France | FR-GRA (Gravelines) |

The guarantee is structural, not a policy statement:

- **Non-EU providers are absent by construction, not by preference.** There is no US-domiciled entry in the routing table, no fallback list and no configuration switch that adds one. Changing that requires a code change that goes through review.
- **Fail-closed, not fail-over.** If no EU upstream can serve a request, it returns `503 eu_upstream_unavailable`. It never silently reroutes to keep the request alive.
- **Unknown models are refused outright.** Asking for a model that is not in the EU catalogue returns `400 model_not_found` — before any upstream is contacted and without spending credits.
- **Region is pinned per upstream.** No cross-region spillover.
- **We only offer models whose processing location the provider states.** Where a provider does not declare a datacentre country for a model, we do not serve it, however attractive its price.
- **Machine-verifiable.** `GET /.well-known/eu-inference.json` returns each upstream's legal entity, region and DPA link, plus the model→provider map. `GET /v1/inference/models` names the serving provider and region for every model.

Every completion also carries `X-AGENTBUREAU-PROVIDER` and `X-AGENTBUREAU-REGION` response headers, so you can assert residency per call rather than trusting a page.

## Endpoints

| Endpoint | Method | Cost |
| :--- | :--- | :--- |
| `/v1/inference/credits` | POST | x402 — buys a prepaid balance |
| `/v1/inference/chat/completions` | POST | Debited from credits |
| `/v1/inference/credits/{wallet_address}` | GET | Free |
| `/v1/inference/models` | GET | Free |
| `/v1/inference/chat/completions/dry-run` | POST | Free — validates and quotes a ceiling |

As with the rest of the API, prefix with `/dev` for Base Sepolia testnet.

## Quickstart

**1 — Buy credits.** The same four-step x402 flow as every other endpoint.

```bash
curl -i -X POST https://agentbureau-api.datafortress.cloud/v1/inference/credits \
     -H "Content-Type: application/json" \
     -d '{"amount_usdc": 10.0, "nonce": "'"$(uuidgen)"'"}'
# 402, PAYMENT-REQUIRED: 10.00; USDC; eip155:8453; 0x...

# Transfer USDC on Base, sign "AgentBureau Intent: {intent_id}", then retry:
curl -X POST https://agentbureau-api.datafortress.cloud/v1/inference/credits \
     -H "Content-Type: application/json" \
     -H "PAYMENT-SIGNATURE: <tx_hash>" \
     -H "PAYMENT-AUTHORIZATION: <signature>" \
     -d '{"amount_usdc": 10.0, "nonce": "<same_nonce>"}'
# 200 {"balance_usdc":"10.000000","credit_key":"ab_sk_..."}
```

**2 — Point any OpenAI-compatible client at it.**

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://agentbureau-api.datafortress.cloud/v1/inference/",
    api_key=credit_key,          # returned by the top-up above
)

response = client.chat.completions.create(
    model="eu/mistral-small",
    messages=[{"role": "user", "content": "Summarise this Mahnung."}],
)
```

Note the **trailing slash** on `base_url` — without it the OpenAI SDK's URL join drops the last path segment and your requests will 404.

The `credit_key` is a payment receipt handle, not an account credential: no signup, no email, no dashboard, and it dies when the balance does. See [Prepaid Credits](/docs/for-agents/prepaid-credits) for how it is minted, scoped and revoked, and for the signature-based alternative if you would rather hold no bearer token.

## Models

`GET /v1/inference/models` is the source of truth — the catalogue changes as EU providers ship and retire models. Each entry names the provider, its legal entity, the processing region and the current per-million-token price.

```json
{
  "id": "eu/mistral-small",
  "owned_by": "Mistral AI",
  "provider_legal_entity": "Mistral AI SAS, Paris, France (RCS Paris 952 418 325)",
  "region": "FR (Paris)",
  "context_window": 256000,
  "price_usdc_per_1m_input": "0.150000",
  "price_usdc_per_1m_output": "0.600000"
}
```

You are charged actual token usage at these rates plus margin, debited from your credit balance.

## Behaviour worth knowing

- **`max_tokens` is injected when you omit it.** The credit hold needs a real ceiling, so a request without `max_tokens` gets the gateway default (4096). This differs from OpenAI's default — set it explicitly if you care.
- **Streaming is not supported yet.** `stream: true` returns `400 streaming_not_supported` rather than silently ignoring the flag.
- **Unrecognised fields are forwarded.** The request body is passed through to the upstream almost verbatim, so provider-supported features work without waiting for us to model them.

## Errors

| Status | Code | Meaning |
| :--- | :--- | :--- |
| 402 | `insufficient_credits` | Balance cannot cover the request ceiling. Carries `credit_topup_path`. |
| 402 | `no_credential` | No credit key or signature presented. |
| 400 | `model_not_found` | Not in the EU catalogue. No upstream was contacted, nothing charged. |
| 400 | `streaming_not_supported` | Set `stream: false` or omit it. |
| 503 | `eu_upstream_unavailable` | No EU upstream can serve this model. Fails closed; nothing charged. |
| 502 | `eu_upstream_error` | The EU upstream failed. The credit hold is released in full. |

## See also

- [Prepaid Credits](/docs/for-agents/prepaid-credits) — the billing mechanic
- [Störerhaftung](/docs/legal/storerhaftung) — liability when acting for an agent
- [Code Examples](/docs/for-developers/code-examples/)
