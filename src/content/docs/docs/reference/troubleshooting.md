---
title: Troubleshooting
description: Common failure modes and fixes when integrating AgentBureau via REST or MCP.
---

This page covers the most common errors you'll hit when integrating AgentBureau, in the order they typically surface.

## Payment & x402 Errors

### "402 Payment Required" returned but my agent did not parse it

Every paid AgentBureau endpoint returns HTTP **402** on the first call. The response body is JSON containing `payment_link` (EIP-681), `intent_id`, `amount`, `currency`, `chain_id`, `network`, and `nonce`. Many HTTP clients treat 4xx as fatal — you must explicitly handle 402 and extract these fields.

**Fix:** see the [REST API Reference](/docs/for-developers/rest-api-reference) and the runnable examples in [our examples directory](https://github.com/JustinGuese/AgentBureau-402-embodiment-as-a-service/tree/main/examples) — every example handles the full **challenge → pay → retry** loop.

### "Payment Verification Failed: insufficient_amount"

You sent USDC, but the on-chain transfer was for less than the price quoted in the 402 challenge. USDC has 6 decimals on Base — `5.00 USDC = 5_000_000` in raw units. Verify your client multiplied correctly.

### "Payment Verification Failed: wrong_recipient"

Your USDC was sent to the wrong address. The correct recipient is in the 402 response under `PAYMENT-REQUIRED` and the `payment_link` query string. For escrow routes (formations) the recipient is the `MilestoneEscrow` contract, not the operator wallet — they are different addresses.

### "Payment Verification Failed: chain_mismatch" or "wrong_chain"

You paid on the wrong network. Mainnet routes (`/v1/*`) require **Base mainnet (chain_id 8453)** USDC. Testnet routes (`/dev/v1/*`) require **Base Sepolia (chain_id 84532)** USDC. The two USDC contract addresses are different — see [Funding Your Base Wallet](/docs/reference/funding-base-wallet).

### "tx_hash_already_consumed"

You retried the same payment transaction hash on a different intent. Each on-chain payment can only authorize one tool call. Send a fresh payment for the next call.

### "authorization_address_mismatch"

The `PAYMENT-AUTHORIZATION` signature recovers to a different address than the one that paid the USDC. The wallet that signs the SIWE message (`AgentBureau Intent: 0x...`) **must** be the same wallet that sent the USDC.

## Insufficient Balance

If your agent's wallet has no USDC on Base, the on-chain transfer will fail before it even reaches AgentBureau. Common causes:

- USDC is on Ethereum mainnet, not Base — bridge it via [Coinbase](https://www.coinbase.com/), [Across](https://across.to/), or the [official Base bridge](https://bridge.base.com/).
- Wallet has USDC but no ETH for gas — Base requires a small amount of ETH for gas.
- Testing on testnet but funded mainnet (or vice versa) — confirm your RPC URL matches the chain you intend to use.

See [Funding Your Base Wallet](/docs/reference/funding-base-wallet) for end-to-end setup.

## MCP Connection Issues

### `https://agentbureau-api.datafortress.cloud/mcp` returns "Not Acceptable: Client must accept text/event-stream"

You opened the URL in a browser. This is correct behaviour — the MCP endpoint speaks **Streamable HTTP**, which requires the client to send `Accept: application/json, text/event-stream`. Use an MCP client (Claude Desktop, Cursor, Smithery), not a browser.

### Claude Desktop says "Server failed to start" or shows no AgentBureau tools

- Confirm your `claude_desktop_config.json` matches the example in [MCP Connection](/docs/for-agents/mcp-connection).
- For older clients that only speak stdio, use the `mcp-remote` bridge: `npx -y mcp-remote https://agentbureau-api.datafortress.cloud/mcp`.
- Check that you have Node.js 18+ installed (required by `mcp-remote`).
- Restart Claude Desktop fully after editing the config (Cmd-Q on macOS, not just close-window).

### Smithery install button "hangs" or never finishes

Smithery proxies through `agentbureau--guese-justin.run.tools`. If the proxy is cold, the first call can take 5-15 seconds. Retry once. If it still hangs, install via the direct config (Option 2 on [MCP Connection](/docs/for-agents/mcp-connection)) and bypass Smithery.

### MCP tool call returns an error string mentioning "402"

This is the expected `payment_required` flow surfaced via MCP. fastapi-mcp wraps the underlying 402 response as a string error containing `intent_id`, `amount`, `payment_link`, and `chain_id`. Your agent extracts those, sends USDC on Base, then re-invokes the same tool with the additional `PAYMENT-SIGNATURE` and `PAYMENT-AUTHORIZATION` headers. See [Claude Tool Use Example](/docs/for-developers/code-examples/claude-tool-use).

## Idempotency & Duplicate Calls

### "If I call the same tool twice with the same arguments, do I get charged twice?"

No. The gateway derives an `Idempotency-Key` from `sha256(request_body)` when none is provided (the standard practice for MCP clients that can't set arbitrary headers). Identical bodies produce identical `intent_id`s — meaning a duplicate call collapses onto the same payment intent and is rejected as `tx_hash_already_consumed` if you try to pay twice.

### "How do I force a fresh call after editing the body slightly?"

Any change to the request body changes the `intent_id` and creates a new payment intent. If you want to re-send the *same* document (e.g., resend an identical fax), set the `Idempotency-Key` header to a fresh UUID — that overrides the body-hash fallback.

## REST-Specific

### My request to `/v1/...` returns 405 Method Not Allowed

You sent a `GET` to a `POST`-only endpoint. Most paid AgentBureau routes only accept `POST`. Check the [REST API Reference](/docs/for-developers/rest-api-reference) for the correct method per route.

### CORS error in browser ("Origin not allowed")

The gateway only allows browser requests from `agentbureau.de`, `openclawgateway.com`, `claude.ai`, `anthropic.com`, `smithery.ai`, and `localhost`. If you need to call AgentBureau from a different origin, use a server-side proxy or contact us to get added to the allow-list.

## Cloudflare & Cold Starts

### First request after idle hangs for 5-30 seconds

The API runs behind Cloudflare in front of a container that scales to zero. The first request after a long idle wakes the container — expect a one-shot ~5 second cold start. Subsequent requests are sub-second. If your agent needs warm latency, send a `GET /healthz` every 5 minutes to keep the container hot.

### "502 Bad Gateway" or "504 Gateway Timeout"

Almost always a cold-start race. Retry once with a 10-second backoff. If you still get 5xx after three retries, check status at our discovery endpoints (`/.well-known/x402`, `/agents.json`) — these are static and proxy-cached, so 200s there confirm the edge is healthy.

## Testnet (Base Sepolia)

### "Why does the same call cost 0 USDC on `/dev/*` but 5 USDC on `/v1/*`?"

Both networks charge the same nominal price, but **Base Sepolia USDC has zero economic value** — you can mint test USDC for free from any Sepolia faucet. Use `/dev/*` to develop and integrate without real spend. Switch to `/v1/*` only when you're ready to pay with real USDC.

### My testnet payment was confirmed but `/dev/v1/...` still returns 402

You probably paid on Base mainnet to a Sepolia route (or vice versa). Confirm `chain_id` in the 402 response matches the chain you actually paid on.

## Still Stuck?

- File an issue at [github.com/JustinGuese/AgentBureau-402-embodiment-as-a-service](https://github.com/JustinGuese/AgentBureau-402-embodiment-as-a-service/issues)
- Email via [/contact](https://agentbureau.de/contact)
- Check the [Changelog](/docs/changelog) for recent breaking changes
