import { createWalletClient, http, parseAbi, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: '../.env' });

// Configuration
const PRIVATE_KEY = (process.env.PRIVATE_KEY || '0x...') as `0x${string}`;
const RPC_URL = process.env.RPC_URL || 'https://mainnet.base.org';
const API_BASE = process.env.API_BASE || 'https://agentbureau-api.datafortress.cloud/v1';
const USDC_ADDRESS = (process.env.USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913') as `0x${string}`;
const SERVICE_ENDPOINT = `${API_BASE}/invoices`;

const account = privateKeyToAccount(PRIVATE_KEY);
const client = createWalletClient({
  account,
  chain: base,
  transport: http(RPC_URL),
}).extend(publicActions);

async function runFlow() {
  const payload = {
    customer_details: {
        name: "Max Mustermann GmbH",
        email: "billing@example.com",
        address: "Hauptstr. 1, 10115 Berlin, Germany"
    },
    line_items: [
        {
            description: "AI Consulting Services",
            quantity: 10,
            unit_price: 150.00
        }
    ]
  };

  const idempotencyKey = randomUUID();
  console.log(`Calling ${SERVICE_ENDPOINT} with Idempotency-Key: {idempotencyKey}...`);

  // 1. Initial Call (Expect 402)
  const response = await fetch(SERVICE_ENDPOINT, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 402) {
    const data = await response.json();
    const intentId = data.intent_id as `0x${string}`;
    
    const paymentRequired = response.headers.get('PAYMENT-REQUIRED');
    if (!paymentRequired) throw new Error('Missing PAYMENT-REQUIRED header');
    
    const parts = paymentRequired.split(';').map(s => s.trim());
    const amountRaw = BigInt(Math.floor(parseFloat(parts[0]) * 1_000_000));
    const receiver = parts[3] as `0x${string}`;

    console.log(`402 Received. Intent ID: ${intentId}`);
    console.log(`Payment Required: ${parts[0]} USDC to {receiver}`);

    // 2. Send USDC Transfer
    const usdcAbi = parseAbi([
      'function transfer(address to, uint256 amount) returns (bool)'
    ]);
    
    const hash = await client.writeContract({
      address: USDC_ADDRESS,
      abi: usdcAbi,
      functionName: 'transfer',
      args: [receiver, amountRaw],
    });

    console.log(`Transaction sent: ${hash}. Waiting for confirmation...`);
    await client.waitForTransactionReceipt({ hash });

    // 3. Sign the Intent ID for Agent Authorization
    console.log('Signing intent for authorization...');
    const authorization = await client.signMessage({
      message: `AgentBureau Intent: ${intentId}`,
    });

    // 4. Retry with payment signature and authorization
    console.log('Retrying with payment signature and authorization...');
    const finalResponse = await fetch(SERVICE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
        'PAYMENT-SIGNATURE': hash,
        'PAYMENT-AUTHORIZATION': authorization,
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
