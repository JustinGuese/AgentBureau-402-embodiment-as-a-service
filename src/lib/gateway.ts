// Single source of truth for the AgentBureau gateway: network configs and the priced
// service catalog. Shared by LivePlayground and MandateBuilder.
//
// Prices mirror PRICED_ROUTES in the gateway's src/gateway/config.py, which is canonical.
// Company formation is DYNAMIC there (fee + Stammkapital); the figure below is the GmbH
// default the middleware falls back to (3,000 fee + 12,500 Stammkapital).

export const MAINNET_CONFIG = {
  apiBase: 'https://agentbureau-api.datafortress.cloud',
  usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`,
  chainId: 8453,
  chainHex: '0x2105',
  scanBase: 'https://basescan.org',
  label: 'Mainnet',
  chainName: 'mainnet',
};

export const TESTNET_CONFIG = {
  apiBase: 'https://agentbureau-api.datafortress.cloud/dev',
  usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`,
  chainId: 84532,
  chainHex: '0x14a34',
  scanBase: 'https://sepolia.basescan.org',
  label: 'Testnet',
  chainName: 'testnet',
};

export type EndpointId =
  | 'fax'
  | 'invoice'
  | 'letter'
  | 'company_formation'
  | 'bank_account'
  | 'vat_registration'
  | 'vat_return'
  | 'inkasso'
  | 'eu_presence'
  | 'annual_filing'
  | 'vollmacht'
  | 'vollmacht_notarized';

export type Endpoint = {
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

export const ENDPOINTS: Endpoint[] = [
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
    suggestedTool: 'create_invoice',
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
    priceLabel: '15,500.00 USDC',
    priceUnits: 15_500_000_000n,
    suggestedTool: 'form_company',
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
    suggestedTool: 'eu_presence_bundle',
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
    suggestedTool: 'create_annual_filing',
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
    suggestedTool: 'issue_vollmacht_notarized',
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

/** Price in whole USDC, for spend-cap arithmetic. */
export const priceUsdc = (endpoint: Endpoint) => Number(endpoint.priceUnits) / 1_000_000;

/**
 * Display price for an endpoint. The homepage service cards and the pricing table both
 * read this, so a price change in ENDPOINTS above propagates to every surface instead of
 * being re-typed per component (which is how the cards ended up shipping an empty "Ab ").
 */
export const priceLabelFor = (id: EndpointId): string =>
  ENDPOINTS.find((e) => e.id === id)?.priceLabel ?? '';

/**
 * Conversion value in USD for a CTA target, used to weight the Meta/GA `Lead` event.
 * Without this every click — docs, playground, GmbH — reports as an identical unweighted
 * Lead and the ad platforms cannot optimise toward the tickets that actually pay.
 * Values are deliberately the *service* price, not an expected value; Meta treats them as
 * relative weights, so their ratio is what matters.
 */
export const LEAD_VALUES: Record<string, number> = {
  '/eu-presence': 5000,
  '/gmbh-gruenden': 15500,
  '/pricing': 500,
  '/agent-spend-controls': 100,
  '/invoice-api': 5,
  '/letter-api': 3,
  '/fax-api': 1,
  '/playground': 5,
  '/docs/quickstart': 1,
};

export const truncateAddress = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

export const formatUsdc = (value: number) =>
  value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
