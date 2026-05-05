import { useState } from 'react';
import { createWalletClient, custom, parseAbi, parseUnits, publicActions } from 'viem';
import { base, baseSepolia } from 'viem/chains';

const MAINNET_CONFIG = {
  apiBase: 'https://agentbureau-api.datafortress.cloud',
  usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`,
  chainId: 8453,
  chainHex: '0x2105',
  scanBase: 'https://basescan.org',
  label: 'Mainnet'
};

const TESTNET_CONFIG = {
  apiBase: 'https://agentbureau-api.datafortress.cloud/dev',
  usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`,
  chainId: 84532,
  chainHex: '0x14a34',
  scanBase: 'https://sepolia.basescan.org',
  label: 'Testnet'
};

type EndpointId = 'fax' | 'invoice' | 'letter' | 'company_formation' | 'bank_account' | 'vat_registration' | 'vat_return' | 'inkasso' | 'eu_presence' | 'annual_filing' | 'vollmacht' | 'vollmacht_notarized';

type Endpoint = {
  id: EndpointId;
  label: string;
  path: string;
  docsPath: string;
  priceLabel: string;
  priceUnits: bigint;
  suggestedTool: string;
  payload: Record<string, unknown>;
  simSuccess: Record<string, unknown>;
};

const ENDPOINTS: Endpoint[] = [
  {
    id: 'fax',
    label: 'Fax API',
    path: '/v1/fax',
    docsPath: '/docs/services/fax',
    priceLabel: '1.00 USDC',
    priceUnits: 1_000_000n,
    suggestedTool: 'send_fax',
    payload: {
      recipient: '+49123456789',
      content: 'Hello from AgentBureau TypeScript Fax Example!',
    },
    simSuccess: {
      status: 'queued',
      id: 'fax_sim_a1b2c3',
      recipient: '+49123456789',
      pages: 1,
      eta_seconds: 30,
    },
  },
  {
    id: 'invoice',
    label: 'Invoice API',
    path: '/v1/invoices',
    docsPath: '/docs/services/invoicing',
    priceLabel: '5.00 USDC',
    priceUnits: 5_000_000n,
    suggestedTool: 'send_german_invoice',
    payload: {
      customer_details: {
        name: 'Max Mustermann GmbH',
        address: 'Hauptstr. 1, 10115 Berlin',
        vat_id: 'DE123456789',
      },
      line_items: [
        { description: 'Consulting hours', quantity: 10, unit_price_eur: 150 },
      ],
    },
    simSuccess: {
      status: 'issued',
      invoice_id: 'inv_sim_xyz789',
      pdf_url: 'https://example.com/sim-invoice.pdf',
      total_eur: 1500,
    },
  },
  {
    id: 'letter',
    label: 'Letter API',
    path: '/v1/letters',
    docsPath: '/docs/services/letters',
    priceLabel: '3.00 USDC',
    priceUnits: 3_000_000n,
    suggestedTool: 'send_letter',
    payload: {
      recipient_address: {
        name: 'Erika Musterfrau',
        street: 'Beispielweg 42',
        city: 'Munich',
        postal_code: '80331',
        country: 'DE',
      },
      content_pdf_url: 'https://example.com/letter.pdf',
    },
    simSuccess: {
      status: 'scheduled',
      tracking_id: 'ltr_sim_q9w8e7',
      estimated_delivery: '2026-05-04',
    },
  },
  {
    id: 'company_formation',
    label: 'Company Formation',
    path: '/v1/companies/formations',
    docsPath: '/docs/services/company-formation',
    priceLabel: '1,000.00 USDC',
    priceUnits: 1_000_000_000n,
    suggestedTool: 'start_company_formation',
    payload: {
      company_name: 'AI Agent Ventures GmbH',
      company_type: 'GmbH',
      stammkapital: 25000,
      founder_name: 'Alice Agent',
      founder_address: 'Main Street 1, Berlin',
    },
    simSuccess: {
      status: 'initiated',
      task_id: 'form_sim_123',
      message: 'Formation process started. Notary appointment being scheduled.',
    },
  },
  {
    id: 'bank_account',
    label: 'Business Bank Account',
    path: '/v1/companies/bank-account',
    docsPath: '/docs/for-developers/rest-api-reference',
    priceLabel: '500.00 USDC',
    priceUnits: 500_000_000n,
    suggestedTool: 'open_bank_account',
    payload: {
      company_id: 'comp_888',
      preferred_bank: 'Qonto',
      beneficial_owners: [{ name: 'Alice Agent', ownership: 100 }],
    },
    simSuccess: {
      status: 'processing',
      task_id: 'bank_sim_456',
      message: 'Bank account opening initiated. KYC link sent to founder.',
    },
  },
  {
    id: 'vat_registration',
    label: 'VAT Registration',
    path: '/v1/tax/vat-register',
    docsPath: '/docs/for-developers/rest-api-reference',
    priceLabel: '500.00 USDC',
    priceUnits: 500_000_000n,
    suggestedTool: 'register_vat',
    payload: {
      company_id: 'comp_888',
      business_activity: 'Software as a Service',
    },
    simSuccess: {
      status: 'submitted',
      task_id: 'vat_sim_789',
      message: 'VAT registration form submitted to tax office.',
    },
  },
  {
    id: 'vat_return',
    label: 'VAT Return Filing',
    path: '/v1/tax/vat-return',
    docsPath: '/docs/for-developers/rest-api-reference',
    priceLabel: '100.00 USDC',
    priceUnits: 100_000_000n,
    suggestedTool: 'submit_vat_return',
    payload: {
      company_id: 'comp_888',
      period: '2025-Q1',
      revenue_breakdown: { de: 10000, eu: 5000, world: 2000 },
    },
    simSuccess: {
      status: 'filed',
      receipt_id: 'rcpt_sim_333',
      tax_due_eur: 1900,
    },
  },
  {
    id: 'inkasso',
    label: 'Debt Collection (Inkasso)',
    path: '/v1/legal/inkasso',
    docsPath: '/docs/for-developers/rest-api-reference',
    priceLabel: '50.00 USDC',
    priceUnits: 50_000_000n,
    suggestedTool: 'collect_debt',
    payload: {
      debtor_name: 'Bad Payee Ltd',
      debtor_address: 'Shady Lane 4, London',
      amount: 1500,
      invoice_pdf_uri: 'https://example.com/unpaid-invoice.pdf',
    },
    simSuccess: {
      status: 'active',
      task_id: 'ink_sim_012',
      message: 'Debt collection case opened. First dunning letter sent.',
    },
  },
  {
    id: 'eu_presence',
    label: 'EU Presence Bundle',
    path: '/v1/companies/eu-presence-bundle',
    docsPath: '/docs/services/company-formation',
    priceLabel: '5,000.00 USDC',
    priceUnits: 5_000_000_000n,
    suggestedTool: 'create_eu_presence',
    payload: {
      company_name: 'Global Agent Corp',
      founder_name: 'Bob Builder',
      founder_address: 'Tech Hub 1, San Francisco',
      stammkapital: 12500,
    },
    simSuccess: {
      status: 'bundled',
      bundle_id: 'bundle_sim_999',
      services: ['formation', 'address', 'bank_account', 'vat_reg'],
    },
  },
  {
    id: 'annual_filing',
    label: 'Annual Corporate Filing',
    path: '/v1/companies/annual-filing',
    docsPath: '/docs/for-developers/rest-api-reference',
    priceLabel: '200.00 USDC',
    priceUnits: 200_000_000n,
    suggestedTool: 'submit_annual_filing',
    payload: {
      company_id: 'comp_888',
      fiscal_year: 2025,
      gmbh_or_ug: 'GmbH',
      requested_filings: ['ebilanz', 'bundesanzeiger'],
    },
    simSuccess: {
      status: 'filed',
      task_id: 'file_sim_111',
      confirmation_number: 'CONF-2025-XYZ',
    },
  },
  {
    id: 'vollmacht',
    label: 'Power of Attorney (Vollmacht)',
    path: '/v1/legal/vollmacht',
    docsPath: '/docs/for-developers/rest-api-reference',
    priceLabel: '200.00 USDC',
    priceUnits: 200_000_000n,
    suggestedTool: 'issue_vollmacht',
    payload: {
      principal: { name: 'Alice Agent', address: 'Berlin' },
      agent: { name: 'Bob Bot', address: 'Cloud' },
      scope_clauses: ['signing_contracts', 'opening_bank_accounts'],
    },
    simSuccess: {
      status: 'issued',
      vollmacht_id: 'vol_sim_222',
      valid_until: '2027-05-05',
    },
  },
  {
    id: 'vollmacht_notarized',
    label: 'Notarized Power of Attorney',
    path: '/v1/legal/vollmacht-notarized',
    docsPath: '/docs/for-developers/rest-api-reference',
    priceLabel: '1,500.00 USDC',
    priceUnits: 1_500_000_000n,
    suggestedTool: 'issue_notarized_vollmacht',
    payload: {
      principal: { name: 'Alice Agent', address: 'Berlin' },
      agent: { name: 'Bob Bot', address: 'Cloud' },
      scope_clauses: ['signing_contracts', 'real_estate_transactions'],
    },
    simSuccess: {
      status: 'notary_scheduled',
      task_id: 'not_sim_444',
      appointment_date: '2026-05-15',
    },
  },
];

type Mode = 'sim' | 'testnet' | 'mainnet';

type Step =
  | { kind: 'request'; data: any }
  | { kind: '402'; data: any }
  | { kind: 'tx'; hash: string; scanBase: string }
  | { kind: 'success'; data: any }
  | { kind: 'error'; message: string };

const fakeTxHash = () =>
  '0x' +
  Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const truncate = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function LivePlayground() {
  const [endpoint, setEndpoint] = useState<Endpoint>(ENDPOINTS[0]);
  const [mode, setMode] = useState<Mode>('sim');
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<`0x${string}` | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  const config = mode === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG;

  const pushStep = (s: Step) => setSteps((prev) => [...prev, s]);

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      pushStep({
        kind: 'error',
        message: 'No injected wallet detected. Install MetaMask or another EIP-1193 wallet.',
      });
      return;
    }
    try {
      const accounts: string[] = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      const cid: string = await window.ethereum.request({ method: 'eth_chainId' });
      setAccount(accounts[0] as `0x${string}`);
      setChainId(parseInt(cid, 16));
    } catch (err: any) {
      pushStep({ kind: 'error', message: err?.message || 'Failed to connect wallet' });
    }
  };

  const switchToNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: config.chainHex }],
      });
      setChainId(config.chainId);
    } catch (err: any) {
      // If chain not added, try adding it
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              mode === 'mainnet' ? {
                chainId: MAINNET_CONFIG.chainHex,
                chainName: 'Base',
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: [MAINNET_CONFIG.scanBase],
              } : {
                chainId: TESTNET_CONFIG.chainHex,
                chainName: 'Base Sepolia',
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: [TESTNET_CONFIG.scanBase],
              }
            ],
          });
        } catch (addErr: any) {
           pushStep({ kind: 'error', message: addErr?.message || 'Failed to add chain' });
        }
      } else {
        pushStep({ kind: 'error', message: err?.message || 'Failed to switch chain' });
      }
    }
  };

  const runSimulated = async () => {
    pushStep({ kind: 'request', data: { method: 'POST', path: endpoint.path, body: endpoint.payload } });
    await sleep(700);
    pushStep({
      kind: '402',
      data: {
        status: 402,
        error: 'Payment Required',
        payment_link: `ethereum:${MAINNET_CONFIG.usdc}@${MAINNET_CONFIG.chainId}/transfer?address=0x82064a8b3c4d5e6f7890a1b2c3d4e5f6789abcde&uint256=${endpoint.priceUnits.toString()}`,
        payment_nonce: `nonce_${Math.random().toString(36).slice(2, 8)}`,
        message: `x402 Challenge: Please send ${endpoint.priceLabel} to the vault on Base to execute this action.`,
        suggested_tool: endpoint.suggestedTool,
      },
    });
    await sleep(900);
    const hash = fakeTxHash();
    pushStep({ kind: 'tx', hash, scanBase: MAINNET_CONFIG.scanBase });
    await sleep(900);
    pushStep({ kind: 'success', data: endpoint.simSuccess });
  };

  const runLive = async () => {
    if (!window.ethereum) {
      pushStep({
        kind: 'error',
        message: 'No injected wallet detected. Install MetaMask or another EIP-1193 wallet.',
      });
      return;
    }
    if (chainId !== config.chainId) {
      pushStep({
        kind: 'error',
        message: `Wrong network (chainId ${chainId}). Switch to ${config.label} (${config.chainId}) and try again.`,
      });
      return;
    }

    const wallet = createWalletClient({
      account: account as `0x${string}`,
      chain: mode === 'mainnet' ? base : baseSepolia,
      transport: custom(window.ethereum),
    }).extend(publicActions);

    const url = `${config.apiBase}${endpoint.path}`;
    const idempotencyKey = crypto.randomUUID();
    pushStep({ kind: 'request', data: { method: 'POST', url, body: endpoint.payload, headers: { 'Idempotency-Key': idempotencyKey } } });

    const initial = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(endpoint.payload),
    });

    if (initial.status !== 402) {
      const body = await initial.json().catch(() => ({}));
      if (initial.ok) {
        pushStep({ kind: 'success', data: body });
      } else {
        pushStep({ kind: 'error', message: `Unexpected status ${initial.status}: ${JSON.stringify(body)}` });
      }
      return;
    }

    const paymentRequired = initial.headers.get('PAYMENT-REQUIRED');
    const challengeJson = await initial.json().catch(() => ({}));
    const intentId = challengeJson.intent_id;
    pushStep({ kind: '402', data: { ...challengeJson, _header: paymentRequired } });

    if (!paymentRequired) {
      pushStep({ kind: 'error', message: 'Missing PAYMENT-REQUIRED header on 402 response.' });
      return;
    }

    // x402 header format: "<amount>; <currency>; eip155:<chainId>; <receiver>"
    const parts = paymentRequired.split(';').map((s) => s.trim());
    const receiver = parts[3] as `0x${string}` | undefined;
    if (!receiver || !receiver.startsWith('0x') || !parts[0]) {
      pushStep({ kind: 'error', message: `Could not parse PAYMENT-REQUIRED: ${paymentRequired}` });
      return;
    }
    const amount = parseUnits(parts[0], 6);

    const hash = await wallet.writeContract({
      address: config.usdc,
      abi: parseAbi(['function transfer(address to, uint256 amount) returns (bool)']),
      functionName: 'transfer',
      args: [receiver, amount],
    });
    pushStep({ kind: 'tx', hash, scanBase: config.scanBase });

    await wallet.waitForTransactionReceipt({ hash });

    // 3. Sign the Intent ID for Agent Authorization
    const authorization = await wallet.signMessage({
      message: `AgentBureau Intent: ${intentId}`,
    });

    const final = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
        'PAYMENT-SIGNATURE': hash,
        'PAYMENT-AUTHORIZATION': authorization,
      },
      body: JSON.stringify(endpoint.payload),
    });
    const body = await final.json().catch(() => ({}));
    if (final.ok) {
      pushStep({ kind: 'success', data: body });
    } else {
      pushStep({ kind: 'error', message: `Retry failed (${final.status}): ${JSON.stringify(body)}` });
    }
  };

  const handleExecute = async () => {
    setSteps([]);
    setLoading(true);
    try {
      if (mode === 'sim') {
        await runSimulated();
      } else {
        await runLive();
      }
    } catch (err: any) {
      const raw = err?.shortMessage || err?.message || 'Unknown error';
      const insufficient = /transfer amount exceeds balance|insufficient|exceeds balance/i.test(raw);
      const message = insufficient
        ? `Insufficient USDC on ${config.label} (${config.chainId}). USDC on Ethereum L1, Arbitrum, Polygon, or a CEX does NOT count — only USDC at ${config.usdc} on Base. See the funding guide: /docs/reference/funding-base-wallet — fastest path is withdrawing from Coinbase with network "Base", or bridging via https://bridge.base.org. Original error: ${raw}`
        : raw;
      pushStep({ kind: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const wrongChain = mode !== 'sim' && account && chainId !== null && chainId !== config.chainId;

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/50 flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold">Interactive API Playground</h3>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'sim'
              ? 'Simulated x402 protocol flow — no wallet, no payment.'
              : `Live mode on ${config.label}. Requires USDC on ${config.label}.`}
          </p>
        </div>
        <div className="inline-flex rounded-md bg-slate-950 p-1 border border-slate-700">
          <button
            onClick={() => { setMode('sim'); setSteps([]); }}
            className={`px-3 py-1 text-xs font-semibold rounded ${mode === 'sim' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}
          >
            Simulated
          </button>
          <button
            onClick={() => { setMode('testnet'); setSteps([]); }}
            className={`px-3 py-1 text-xs font-semibold rounded ${mode === 'testnet' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}
          >
            Testnet
          </button>
          <button
            onClick={() => { setMode('mainnet'); setSteps([]); }}
            className={`px-3 py-1 text-xs font-semibold rounded ${mode === 'mainnet' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}
          >
            Mainnet
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Select Endpoint</label>
          <select
            className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
            value={endpoint.id}
            onChange={(e) =>
              setEndpoint(ENDPOINTS.find((ex) => ex.id === e.target.value) || ENDPOINTS[0])
            }
          >
            {ENDPOINTS.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.label} ({ex.path}) — {ex.priceLabel}
              </option>
            ))}
          </select>

          <div className="mt-2 flex justify-end">
            <a
              href={endpoint.docsPath}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <span>View Documentation</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          </div>

          {mode !== 'sim' && (
            <div className="mt-4 p-3 bg-slate-800/50 border border-slate-700 rounded-md text-sm">
              {!account ? (
                <button
                  onClick={connectWallet}
                  className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-500"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-slate-300 font-mono text-xs">
                    {truncate(account)}
                  </div>
                  {wrongChain ? (
                    <button
                      onClick={switchToNetwork}
                      className="text-xs bg-yellow-500 text-slate-900 px-2 py-1 rounded font-bold"
                    >
                      Switch to {config.label}
                    </button>
                  ) : (
                    <span className="text-xs text-green-400 font-mono">{config.label} · {config.chainId}</span>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleExecute}
              disabled={loading || (mode !== 'sim' && !account)}
              className="w-full bg-white text-slate-900 font-bold py-3 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Running…' : 'Execute Request'}
            </button>
            {mode !== 'sim' && (
              <p className="text-[11px] text-slate-500 mt-2">
                You'll be asked to approve a USDC transfer of {endpoint.priceLabel} on {config.label}.
              </p>
            )}
          </div>

          <div className="mt-6 p-4 bg-slate-800 rounded-md border border-slate-700">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Request Payload</p>
            <pre className="mt-2 text-sm text-green-400 overflow-x-auto whitespace-pre-wrap">
{`POST ${endpoint.path}
Content-Type: application/json

${JSON.stringify(endpoint.payload, null, 2)}`}
            </pre>
          </div>
        </div>

        <div className="flex flex-col h-full">
          <label className="block text-sm font-medium text-slate-400 mb-2">Flow</label>
          <div className="flex-grow bg-black rounded-md p-4 font-mono text-xs overflow-auto min-h-[300px] space-y-3">
            {steps.length === 0 ? (
              <p className="text-slate-600 italic">No request executed yet.</p>
            ) : (
              steps.map((step, i) => <StepCard key={i} step={step} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepCard({ step }: { step: Step }) {
  switch (step.kind) {
    case 'request':
      return (
        <div className="border-l-2 border-slate-600 pl-3">
          <div className="text-slate-400 uppercase tracking-wider mb-1">1 · Request</div>
          <pre className="text-slate-300 whitespace-pre-wrap">{JSON.stringify(step.data, null, 2)}</pre>
        </div>
      );
    case '402':
      return (
        <div className="border-l-2 border-yellow-500 pl-3">
          <div className="text-yellow-400 uppercase tracking-wider mb-1">2 · 402 Payment Required</div>
          <pre className="text-yellow-200 whitespace-pre-wrap">{JSON.stringify(step.data, null, 2)}</pre>
        </div>
      );
    case 'tx':
      return (
        <div className="border-l-2 border-blue-500 pl-3">
          <div className="text-blue-400 uppercase tracking-wider mb-1">3 · USDC Transfer</div>
          <a
            href={`${step.scanBase}/tx/${step.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 hover:text-blue-200 break-all underline"
          >
            {step.hash}
          </a>
        </div>
      );
    case 'success':
      return (
        <div className="border-l-2 border-green-500 pl-3">
          <div className="text-green-400 uppercase tracking-wider mb-1">4 · Success</div>
          <pre className="text-green-200 whitespace-pre-wrap">{JSON.stringify(step.data, null, 2)}</pre>
        </div>
      );
    case 'error':
      return (
        <div className="border-l-2 border-red-500 pl-3">
          <div className="text-red-400 uppercase tracking-wider mb-1">Error</div>
          <p className="text-red-200 whitespace-pre-wrap">{step.message}</p>
        </div>
      );
  }
}
