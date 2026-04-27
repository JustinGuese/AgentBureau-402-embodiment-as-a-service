import { createWalletClient, http, parseAbi, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

// Configuration
const PRIVATE_KEY = (process.env.PRIVATE_KEY || '0x...') as `0x${string}`;
const RPC_URL = process.env.RPC_URL || 'https://mainnet.base.org';
const API_BASE = process.env.API_BASE || 'https://agentbureau-api.datafortress.cloud/v1';
const USDC_ADDRESS = (process.env.USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913') as `0x${string}`;
const SERVICE_ENDPOINT = `${API_BASE}/companies/formations`;

const account = privateKeyToAccount(PRIVATE_KEY);
const client = createWalletClient({
  account,
  chain: base,
  transport: http(RPC_URL),
}).extend(publicActions);

async function runFlow() {
  const payload = {
    company_name: "Autonomous Ventures GmbH",
    shareholders: [
        {
            name: "Alice Agent",
            shares: 25000,
            address: "Digital Ether 0x123"
        }
    ]
  };

  console.log(`Calling ${SERVICE_ENDPOINT}...`);

  // 1. Initial Call (Expect 402)
  const response = await fetch(SERVICE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (response.status === 402) {
    const paymentRequired = response.headers.get('PAYMENT-REQUIRED');
    if (!paymentRequired) throw new Error('Missing PAYMENT-REQUIRED header');

    const walletMatch = paymentRequired.match(/receiver=([^;]+)/);
    const amountMatch = paymentRequired.match(/amount=([^;]+)/);

    if (!walletMatch || !amountMatch) throw new Error('Invalid payment header');

    const receiver = walletMatch[1] as `0x${string}`;
    const amount = BigInt(amountMatch[1]);

    console.log(`Payment Required: ${amount} raw units to ${receiver}`);

    // 2. Send USDC
    const hash = await client.writeContract({
      address: USDC_ADDRESS,
      abi: parseAbi(['function transfer(address to, uint256 amount) returns (bool)']),
      functionName: 'transfer',
      args: [receiver, amount],
    });

    console.log(`Transaction sent: ${hash}. Waiting for confirmation...`);

    // 3. Wait for confirmation and retry
    await client.waitForTransactionReceipt({ hash });

    console.log('Retrying with payment signature...');
    const finalResponse = await fetch(SERVICE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PAYMENT-SIGNATURE': hash,
      },
      body: JSON.stringify(payload),
    });

    if (finalResponse.ok) {
        console.log('Success!');
        console.log(await finalResponse.json());
    } else {
        console.log(`Final call failed with status ${finalResponse.status}`);
        console.log(await finalResponse.text());
    }
  } else {
    console.log(`Status: ${response.status}`);
    console.log(await response.text());
  }
}

runFlow().catch(console.error);
