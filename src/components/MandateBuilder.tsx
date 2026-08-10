import { useEffect, useMemo, useState } from 'react';
import { createWalletClient, custom, publicActions } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import {
  MAINNET_CONFIG,
  TESTNET_CONFIG,
  ENDPOINTS,
  priceUsdc,
  truncateAddress,
  type Endpoint,
} from '../lib/gateway';
import {
  computeMandateId,
  createMandate,
  curlSnippet,
  fetchMandateStatus,
  mandateMessage,
  mandateRequestBody,
  simulatePolicy,
  DEFAULT_PATHS,
  type Caps,
  type MandateDraft,
  type MandateStatus,
} from '../lib/mandate';
import CapFields from './mandate/CapFields';
import SpendMeter from './mandate/SpendMeter';

// Consent-gated trackers exposed by Landing.astro; no-ops until the cookie banner loads them.
const track = (event: string, params: Record<string, unknown>) =>
  (window as any).trackEcommerce?.(event, params);
const trackLead = (params: Record<string, unknown>) =>
  (window as any).trackConversion?.('Lead', params);

type Mode = 'sim' | 'testnet' | 'mainnet';

const DEMO_CONTROLLER = '0x00000000000000000000000000000000000000A9';

export default function MandateBuilder({ labels }: { labels: Record<string, string> }) {
  const [mode, setMode] = useState<Mode>('sim');
  const [account, setAccount] = useState<`0x${string}` | null>(null);
  const [spender, setSpender] = useState(DEMO_CONTROLLER);
  const [caps, setCaps] = useState<Caps>({ perCall: 5, daily: 25, monthly: 200, total: null });
  const [allowedPaths, setAllowedPaths] = useState<string[]>(DEFAULT_PATHS);
  const [expiryDays, setExpiryDays] = useState(30);
  // Astro SSRs this island, so the nonce and start time must be identical on the server and
  // on the first client render or React throws a hydration mismatch. Both start as fixed
  // placeholders and are replaced client-side on mount.
  const [nonce, setNonce] = useState('');
  const [notBefore, setNotBefore] = useState(() => new Date(0));

  useEffect(() => {
    setNonce(crypto.randomUUID().replace(/-/g, ''));
    setNotBefore(new Date());
  }, []);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ mandateId: string; apiBase: string } | null>(null);
  const [status, setStatus] = useState<MandateStatus | null>(null);

  // Simulator state: which service the visitor is trying, and fake spend already booked.
  const [probe, setProbe] = useState<Endpoint>(ENDPOINTS[0]);
  const [simSpent, setSimSpent] = useState(0);

  const config = mode === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG;

  const draft: MandateDraft = useMemo(
    () => ({
      chain: mode === 'mainnet' ? 'mainnet' : 'testnet',
      controller: account || DEMO_CONTROLLER,
      spender: spender || account || DEMO_CONTROLLER,
      caps,
      allowedPaths,
      notBefore,
      expiresAt: new Date(notBefore.getTime() + expiryDays * 86_400_000),
      nonce,
    }),
    [mode, account, spender, caps, allowedPaths, notBefore, expiryDays, nonce]
  );

  const mandateId = useMemo(() => {
    try {
      return computeMandateId(draft);
    } catch {
      return null;
    }
  }, [draft]);

  const verdict = useMemo(() => simulatePolicy(draft, probe, simSpent), [draft, probe, simSpent]);

  // Poll the live spend meter while a real mandate is on screen.
  useEffect(() => {
    if (!created) return;
    let cancelled = false;
    const tick = () =>
      fetchMandateStatus(created.apiBase, created.mandateId)
        .then((next) => !cancelled && setStatus(next))
        .catch(() => undefined);
    tick();
    const timer = setInterval(tick, 15_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [created]);

  const connectWallet = async () => {
    setError(null);
    if (typeof window === 'undefined' || !window.ethereum) {
      setError(labels.errNoWallet);
      return;
    }
    try {
      const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0] as `0x${string}`);
      setSpender(accounts[0]);
    } catch (err: any) {
      setError(err?.message || labels.errConnect);
    }
  };

  const signAndCreate = async () => {
    if (!mandateId || !account || !window.ethereum) return;
    setBusy(true);
    setError(null);
    track('AddToCart', {
      value: caps.daily ?? caps.perCall ?? 0,
      currency: 'USD',
      content_name: 'Spend Mandate',
      content_category: 'Governance',
    });
    try {
      const walletClient = createWalletClient({
        account: account,
        chain: mode === 'mainnet' ? base : baseSepolia,
        transport: custom(window.ethereum),
      }).extend(publicActions);

      const message = mandateMessage(mandateId);
      const controllerSignature = await walletClient.signMessage({ account, message });

      // Delegation (controller != spender) needs the spender's co-signature too. The
      // browser only holds one key, so that flow belongs in the agent's own runtime.
      const isDelegated = spender.toLowerCase() !== account.toLowerCase();
      if (isDelegated) {
        throw new Error(labels.errDelegation);
      }

      const body = mandateRequestBody(draft, controllerSignature);
      const result = await createMandate(config.apiBase, body);
      setCreated({ mandateId: result.mandate_id, apiBase: config.apiBase });
      trackLead({ content_name: 'Spend Mandate Created', content_category: 'Governance' });
    } catch (err: any) {
      setError(err?.message || labels.errCreate);
    } finally {
      setBusy(false);
    }
  };

  const toggleMode = (next: Mode) => {
    setMode(next);
    setCreated(null);
    setStatus(null);
    setError(null);
    if (next === 'sim') setSpender(account || DEMO_CONTROLLER);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-left">
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-sm font-semibold text-white">{labels.title}</span>
        </div>
        <div className="flex gap-1 bg-slate-800 p-1 rounded-md">
          {(['sim', 'testnet', 'mainnet'] as Mode[]).map((value) => (
            <button
              key={value}
              onClick={() => toggleMode(value)}
              className={`px-3 py-1 text-xs font-semibold rounded ${
                mode === value ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              {labels[`mode_${value}`]}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <CapFields
            caps={caps}
            onCapChange={(key, value) => setCaps((prev) => ({ ...prev, [key]: value }))}
            allowedPaths={allowedPaths}
            onTogglePath={(path) =>
              setAllowedPaths((prev) =>
                prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
              )
            }
            expiryDays={expiryDays}
            onExpiryChange={setExpiryDays}
            spender={spender}
            onSpenderChange={setSpender}
            labels={labels}
            disabled={busy || !!created}
          />

          {mode !== 'sim' && (
            <div className="mt-5 p-3 bg-slate-800/50 border border-slate-700 rounded-md">
              {!account ? (
                <button
                  onClick={connectWallet}
                  className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-500"
                >
                  {labels.connect}
                </button>
              ) : (
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-slate-300 font-mono text-xs">{truncateAddress(account)}</span>
                  <span className="text-xs text-green-400 font-mono">
                    {config.label} · {config.chainId}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="mt-5">
            <button
              onClick={signAndCreate}
              disabled={mode === 'sim' || busy || !account || !!created}
              className="w-full bg-white text-slate-900 font-bold py-3 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-40"
            >
              {busy ? labels.signing : created ? labels.signed : labels.sign}
            </button>
            <p className="text-[11px] text-slate-500 mt-2">
              {mode === 'sim' ? labels.simNotice : labels.signHint}
            </p>
          </div>

          {error && (
            <p className="mt-3 text-xs text-red-400 bg-red-950/40 border border-red-900 rounded p-2">
              {error}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-md border border-slate-700 bg-black p-4">
            <p className="text-xs uppercase font-bold tracking-wider text-slate-400">
              {labels.canonical}
            </p>
            <pre className="mt-2 text-[11px] text-emerald-400 overflow-x-auto whitespace-pre-wrap">
{JSON.stringify(mandateRequestBody(draft, '0x…'), null, 2)}
            </pre>
            <p className="mt-3 text-[11px] text-slate-500 break-all">
              <span className="uppercase tracking-wider text-slate-400">{labels.mandateId}: </span>
              <span className="font-mono text-slate-300">{mandateId ?? '—'}</span>
            </p>
          </div>

          {created ? (
            <>
              {status && (
                <SpendMeter
                  status={status}
                  caps={{ daily: caps.daily, monthly: caps.monthly, total: caps.total }}
                  labels={labels}
                />
              )}
              <div className="rounded-md border border-slate-700 bg-black p-4">
                <p className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  {labels.useIt}
                </p>
                <pre className="mt-2 text-[11px] text-blue-300 overflow-x-auto whitespace-pre-wrap">
{curlSnippet(created.apiBase, created.mandateId, probe)}
                </pre>
              </div>
            </>
          ) : (
            <div className="rounded-md border border-slate-700 bg-slate-800/50 p-4 space-y-3">
              <p className="text-xs uppercase font-bold tracking-wider text-slate-400">
                {labels.simulator}
              </p>
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-white text-sm"
                value={probe.id}
                onChange={(e) => setProbe(ENDPOINTS.find((x) => x.id === e.target.value) || ENDPOINTS[0])}
              >
                {ENDPOINTS.map((endpoint) => (
                  <option key={endpoint.id} value={endpoint.id}>
                    {endpoint.label} — {endpoint.priceLabel}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{labels.alreadySpent}</span>
                <input
                  type="range"
                  min="0"
                  max={Math.max(caps.daily ?? 50, 50)}
                  step="1"
                  value={simSpent}
                  onChange={(e) => setSimSpent(Number(e.target.value))}
                  className="flex-1 accent-blue-500"
                />
                <span className="font-mono text-slate-300 w-16 text-right">{simSpent} USDC</span>
              </div>

              <div
                className={`rounded-md border p-3 font-mono text-[11px] ${
                  verdict.allowed
                    ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300'
                    : 'border-red-900 bg-red-950/40 text-red-300'
                }`}
              >
                <div className="font-bold mb-1">
                  {verdict.allowed ? labels.verdictAllowed : labels.verdictDenied}
                </div>
                {verdict.allowed ? (
                  <div>{labels.verdictAllowedBody.replace('{amount}', String(priceUsdc(probe)))}</div>
                ) : (
                  <div>
                    X-POLICY-DENIED: {verdict.reason}
                    <br />
                    {verdict.capUsdc === null
                      ? labels.verdictDeniedScope.replace('{service}', probe.label)
                      : labels.verdictDeniedBody
                          .replace('{amount}', String(verdict.attemptedUsdc))
                          .replace('{cap}', String(verdict.capUsdc))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
