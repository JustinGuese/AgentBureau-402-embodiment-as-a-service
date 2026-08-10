// Canonical spend-mandate document, id derivation and policy simulation.
//
// The id construction here MUST stay byte-identical to compute_mandate_id() in the
// gateway's src/gateway/services/mandate_service.py — the server recomputes the id from
// the submitted fields and looks up the signature against it. Any divergence shows up as
// a 403 "controller_signature does not recover to controller_address".

import { keccak256, toBytes } from 'viem';
import { ENDPOINTS, priceUsdc, type Endpoint } from './gateway';

export type Caps = {
  perCall: number | null;
  daily: number | null;
  monthly: number | null;
  total: number | null;
};

export type MandateDraft = {
  chain: string;
  controller: string;
  spender: string;
  caps: Caps;
  allowedPaths: string[];
  notBefore: Date;
  expiresAt: Date;
  nonce: string;
};

/** '*' means unlimited — matches _fmt_cap() server-side. */
const fmtCap = (value: number | null) => (value === null ? '*' : value.toFixed(6));

/** Naive UTC, seconds precision — matches _naive_utc(dt).isoformat(timespec='seconds'). */
export const isoSeconds = (date: Date) => date.toISOString().slice(0, 19);

export function mandateSeed(draft: MandateDraft): string {
  const paths = [...draft.allowedPaths].map((p) => p.replace(/\/$/, '')).sort().join(',');
  return [
    draft.chain,
    draft.controller.toLowerCase(),
    draft.spender.toLowerCase(),
    fmtCap(draft.caps.perCall),
    fmtCap(draft.caps.daily),
    fmtCap(draft.caps.monthly),
    fmtCap(draft.caps.total),
    paths,
    isoSeconds(draft.notBefore),
    isoSeconds(draft.expiresAt),
    draft.nonce,
  ].join(':');
}

export const computeMandateId = (draft: MandateDraft) => keccak256(toBytes(mandateSeed(draft)));

export const mandateMessage = (mandateId: string) => `AgentBureau Mandate: ${mandateId}`;

/** The exact JSON body POSTed to /v1/mandates. */
export function mandateRequestBody(draft: MandateDraft, controllerSignature: string, spenderSignature?: string) {
  return {
    controller_address: draft.controller,
    spender_address: draft.spender,
    chain: draft.chain,
    per_call_cap_usdc: draft.caps.perCall,
    daily_cap_usdc: draft.caps.daily,
    monthly_cap_usdc: draft.caps.monthly,
    total_cap_usdc: draft.caps.total,
    allowed_paths: [...draft.allowedPaths].map((p) => p.replace(/\/$/, '')).sort(),
    nonce: draft.nonce,
    not_before: isoSeconds(draft.notBefore),
    expires_at: isoSeconds(draft.expiresAt),
    controller_signature: controllerSignature,
    ...(spenderSignature ? { spender_signature: spenderSignature } : {}),
  };
}

export type PolicyVerdict = {
  allowed: boolean;
  reason: string | null;
  capUsdc: number | null;
  attemptedUsdc: number;
};

/**
 * Client-side mirror of evaluate() in mandate_service.py, used by the simulator so a
 * visitor without a wallet can see the deny-before-you-pay behaviour. The gateway remains
 * the only authority — this never gates a real call.
 */
export function simulatePolicy(draft: MandateDraft, endpoint: Endpoint, spentToday: number): PolicyVerdict {
  const attempted = priceUsdc(endpoint);
  const path = endpoint.path;

  if (draft.allowedPaths.length && !draft.allowedPaths.includes(path)) {
    return { allowed: false, reason: 'path_not_allowed', capUsdc: null, attemptedUsdc: attempted };
  }
  const checks: Array<[number | null, number, string]> = [
    [draft.caps.perCall, attempted, 'per_call_cap_exceeded'],
    [draft.caps.daily, spentToday + attempted, 'daily_cap_exceeded'],
    [draft.caps.total, spentToday + attempted, 'total_cap_exceeded'],
  ];
  for (const [cap, projected, reason] of checks) {
    if (cap !== null && projected > cap) {
      return { allowed: false, reason, capUsdc: cap, attemptedUsdc: attempted };
    }
  }
  return { allowed: true, reason: null, capUsdc: null, attemptedUsdc: attempted };
}

export type MandateStatus = {
  mandate_id: string;
  spent_today_usdc: number;
  spent_month_usdc: number;
  spent_total_usdc: number;
  remaining_today_usdc: number | null;
  remaining_month_usdc: number | null;
  remaining_total_usdc: number | null;
  calls: number;
  active: boolean;
  daily_reset_at: string;
};

export async function createMandate(apiBase: string, body: object): Promise<any> {
  const response = await fetch(`${apiBase}/v1/mandates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.detail || `Gateway returned ${response.status}`);
  }
  return data;
}

export async function fetchMandateStatus(apiBase: string, mandateId: string): Promise<MandateStatus> {
  const response = await fetch(`${apiBase}/v1/mandates/${mandateId}/status`);
  if (!response.ok) throw new Error(`Status lookup failed (${response.status})`);
  return response.json();
}

export const DEFAULT_PATHS = ENDPOINTS.filter((e) =>
  ['fax', 'letter', 'invoice'].includes(e.id)
).map((e) => e.path);

export function curlSnippet(apiBase: string, mandateId: string, endpoint: Endpoint) {
  return `curl -X POST ${apiBase}${endpoint.path} \\
  -H "X-MANDATE-ID: ${mandateId}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(endpoint.payload)}'`;
}
