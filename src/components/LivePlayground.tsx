import React, { useState } from 'react';

const ENDPOINTS = [
  { id: 'fax', label: 'Fax API', path: '/v1/fax', price: '1.00 USDC' },
  { id: 'invoice', label: 'Invoice API', path: '/v1/invoices', price: '5.00 USDC' },
  { id: 'letter', label: 'Letter API', path: '/v1/letters', price: '3.00 USDC' },
];

export default function LivePlayground() {
  const [endpoint, setEndpoint] = useState(ENDPOINTS[0]);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setResponse(null);
    
    // We simulate a real network call to the gateway
    try {
      // In a real scenario, this would be a fetch to the actual API
      // await fetch(`https://agentbureau-api.datafortress.cloud${endpoint.path}`, { method: 'POST' });
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setResponse({
        status: 402,
        error: "Payment Required",
        payment_link: `ethereum:0xUSDC@8453/transfer?address=0x82064...&uint256=${endpoint.price.replace(/[^0-9]/g, '')}000000`,
        payment_nonce: `nonce_${Math.random().toString(36).substring(7)}`,
        message: `x402 Challenge: Please send ${endpoint.price} to the vault on Base to execute this action.`,
        suggested_tool: endpoint.id === 'fax' ? 'send_fax' : (endpoint.id === 'invoice' ? 'send_german_invoice' : 'send_letter')
      });
    } catch (err) {
      setResponse({ error: "Connection to Gateway failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
        <div>
          <h3 className="text-white font-bold">Interactive API Simulator</h3>
          <p className="text-xs text-slate-400 mt-1">Simulating live x402 protocol challenges</p>
        </div>
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-slate-700 animate-pulse"></div>
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Live System</span>
        </div>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Select Endpoint</label>
          <select 
            className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
            value={endpoint.id}
            onChange={(e) => setEndpoint(ENDPOINTS.find(ex => ex.id === e.target.value) || ENDPOINTS[0])}
          >
            {ENDPOINTS.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.label} ({ex.path})</option>
            ))}
          </select>

          <div className="mt-6">
            <button 
              onClick={handleTest}
              disabled={loading}
              className="w-full bg-white text-slate-900 font-bold py-3 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Calling API...' : 'Execute Request'}
            </button>
          </div>

          <div className="mt-6 p-4 bg-slate-800 rounded-md border border-slate-700">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Request Details</p>
            <pre className="mt-2 text-sm text-green-400 overflow-x-auto">
              {`POST ${endpoint.path} HTTP/1.1\nHost: agentbureau-api.datafortress.cloud\nContent-Type: application/json\n\n{ "to": "+49...", "content": "..." }`}
            </pre>
          </div>
        </div>

        <div className="flex flex-col h-full">
          <label className="block text-sm font-medium text-slate-400 mb-2">Response</label>
          <div className="flex-grow bg-black rounded-md p-4 font-mono text-sm overflow-auto min-h-[300px]">
            {response ? (
              <pre className={response.status === 402 ? "text-yellow-400" : "text-green-400"}>
                {JSON.stringify(response, null, 2)}
              </pre>
            ) : (
              <p className="text-slate-600 italic">No request executed yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

