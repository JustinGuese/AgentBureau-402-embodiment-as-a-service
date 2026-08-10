/**
 * Create a spend mandate and watch it refuse an over-budget call.
 *
 * Unlike the other examples here, this one needs NO USDC and sends NO transaction.
 * A mandate is a signature, and an over-budget call is refused before any payment is
 * requested — so the whole script runs on an empty wallet.
 *
 * Docs: https://agentbureau.de/docs/for-agents/spend-mandates
 */
import { keccak256, toBytes } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: '../.env' });

const PRIVATE_KEY = (process.env.PRIVATE_KEY || '0x...') as `0x${string}`;
const API_BASE = process.env.API_BASE || 'https://agentbureau-api.datafortress.cloud/v1';
// The mount decides the chain, and it is part of the signed document — a testnet
// mandate can never authorize mainnet spend.
const CHAIN = process.env.CHAIN || (API_BASE.includes('/dev/') ? 'testnet' : 'mainnet');

const account = privateKeyToAccount(PRIVATE_KEY);

const CAPS = {
  per_call_cap_usdc: 2.0 as number | null, // a single call may never cost more
  daily_cap_usdc: 10.0 as number | null,   // UTC calendar day
  monthly_cap_usdc: null as number | null, // null = unlimited
  total_cap_usdc: null as number | null,
};
// Empty array = every priced endpoint. Inkasso is left out so the scope check has
// something to refuse.
const ALLOWED_PATHS = ['/v1/fax', '/v1/letters', '/v1/invoices'];
const VALID_FOR_DAYS = 30;

/** '*' means unlimited; six decimals otherwise. Must match the server byte for byte. */
const fmtCap = (v: number | null) => (v === null ? '*' : v.toFixed(6));

/** Naive UTC, second precision. */
const iso = (d: Date) => d.toISOString().slice(0, 19);

function buildMandate() {
  const notBefore = new Date();
  const expiresAt = new Date(notBefore.getTime() + VALID_FOR_DAYS * 86_400_000);
  const nonce = randomUUID().replace(/-/g, '');
  const paths = [...ALLOWED_PATHS].map((p) => p.replace(/\/$/, '')).sort();

  // The canonical seed. The server recomputes this string from your JSON and recovers
  // the signer against the resulting hash, so any difference in ordering, casing or
  // number formatting surfaces as a 403.
  const seed = [
    CHAIN,
    account.address.toLowerCase(),
    account.address.toLowerCase(),
    fmtCap(CAPS.per_call_cap_usdc),
    fmtCap(CAPS.daily_cap_usdc),
    fmtCap(CAPS.monthly_cap_usdc),
    fmtCap(CAPS.total_cap_usdc),
    paths.join(','),
    iso(notBefore),
    iso(expiresAt),
    nonce,
  ].join(':');

  const mandateId = keccak256(toBytes(seed));
  return { mandateId, notBefore, expiresAt, nonce, paths };
}

async function post(path: string, body: unknown, headers: Record<string, string> = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  return { res, json: await res.json().catch(() => ({} as any)) };
}

async function runFlow() {
  const { mandateId, notBefore, expiresAt, nonce, paths } = buildMandate();
  console.log(`Wallet: ${account.address}`);
  console.log(`Computed mandate_id: ${mandateId}`);

  const controllerSignature = await account.signMessage({
    message: `AgentBureau Mandate: ${mandateId}`,
  });

  // 1. Create it. Free — no 402, no payment.
  const created = await post('/mandates', {
    controller_address: account.address,
    spender_address: account.address, // same wallet: no co-signature needed
    chain: CHAIN,
    ...CAPS,
    allowed_paths: paths,
    nonce,
    not_before: iso(notBefore),
    expires_at: iso(expiresAt),
    controller_signature: controllerSignature,
  });
  if (!created.res.ok) {
    console.error(`Create failed (${created.res.status}):`, created.json);
    return;
  }
  console.log(`Created. Server agrees on id: ${created.json.mandate_id === mandateId}\n`);

  const headers = { 'X-MANDATE-ID': mandateId };

  // 2. A fax costs 1.00 USDC — under the 2.00 per-call cap, so the normal 402 arrives.
  const fax = await post('/fax',
    { recipient_number: '+49123456789', content: 'Within budget.' }, headers);
  console.log(`POST /fax      (1.00 USDC) -> ${fax.res.status} ${
    fax.res.status === 402 ? 'payment requested, as normal' : JSON.stringify(fax.json)}`);

  // 3. An invoice costs 5.00 USDC — over the cap. 403, and no payment was ever asked
  //    for, so the agent cannot pay for something it was not allowed to do.
  const invoice = await post('/invoices', {
    recipient_name: 'Acme GmbH', recipient_email: 'billing@acme.de',
    amount: 100.0, description: 'Consulting',
  }, headers);
  console.log(`POST /invoices (5.00 USDC) -> ${invoice.res.status} X-POLICY-DENIED: ${
    invoice.res.headers.get('x-policy-denied')}`);
  if (invoice.json.cap_usdc !== undefined) {
    console.log(`  attempted ${invoice.json.attempted_usdc} USDC against a cap of ${invoice.json.cap_usdc} USDC`);
  }

  // 4. Anything outside the allowlist is refused regardless of price.
  const inkasso = await post('/legal/inkasso', {
    debtor_name: 'Late Payer Ltd', debtor_address: 'Shady Lane 4, London',
    amount: 1500, invoice_pdf_uri: 'https://example.com/unpaid.pdf', dunning_history: [],
  }, headers);
  console.log(`POST /legal/inkasso        -> ${inkasso.res.status} X-POLICY-DENIED: ${
    inkasso.res.headers.get('x-policy-denied')}`);

  // 5. Remaining budget, any time, for free.
  const status = await (await fetch(`${API_BASE}/mandates/${mandateId}/status`)).json();
  console.log(`\nBudget: ${status.spent_today_usdc} spent today, ${
    status.remaining_today_usdc} remaining, resets ${status.daily_reset_at}`);
}

runFlow().catch(console.error);
