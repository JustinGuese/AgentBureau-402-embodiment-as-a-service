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
    company_type: "GMBH",
    stammkapital: 12500.0,
    founder_name: "Alice Agent",
    founder_address: "Digital Ether 0x123",
    description: "Building the future of agentic economy."
  };

  const idempotencyKey = randomUUID();
  console.log(`Calling ${SERVICE_ENDPOINT} with Idempotency-Key: ${idempotencyKey}...`);

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
    const paymentLink = data.payment_link;
    
    console.log(`402 Received. Intent ID: ${intentId}`);

    // Parse payment link for escrow deposit arguments
    // ethereum:<address>@<chain_id>/deposit?bytes32=<intent_id>&uint256=<amount>&uint256=<duration>&address=<payee>&uint16=<feeBps>&uint16[3]=<milestones>&bytes=<sig>
    const url = new URL(paymentLink.replace('ethereum:', 'http:')); // trick URL parser
    const escrowAddress = url.pathname.split('@')[0].replace('/', '') as `0x${string}`;
    const params = url.searchParams;
    
    const amountRaw = BigInt(params.get('uint256') || '0');
    const duration = BigInt(url.search.match(/uint256=([^&]+)/g)?.[1].split('=')[1] || '0'); 
    // Manual parsing because of duplicate keys in URLSearchParams
    const allUint256 = url.search.match(/uint256=([^&]+)/g)?.map(v => v.split('=')[1]) || [];
    const amount = BigInt(allUint256[0] || '0');
    const dur = BigInt(allUint256[1] || '0');
    const payee = params.get('address') as `0x${string}`;
    const feeBps = parseInt(params.get('uint16') || '0');
    const milestones = params.get('uint16[3]')?.split(',').map(Number) as [number, number, number];
    const operatorSignature = params.get('bytes') as `0x${string}`;

    console.log(`Depositing ${Number(amount) / 1e6} USDC into Escrow at ${escrowAddress}...`);

    // 2. Approve USDC for Escrow
    const usdcAbi = parseAbi([
      'function approve(address spender, uint256 amount) returns (bool)'
    ]);
    
    console.log('Approving USDC...');
    const approveHash = await client.writeContract({
      address: USDC_ADDRESS,
      abi: usdcAbi,
      functionName: 'approve',
      args: [escrowAddress, amount],
    });
    await client.waitForTransactionReceipt({ hash: approveHash });

    // 3. Send Escrow Deposit
    const escrowAbi = parseAbi([
      'function deposit(bytes32 intentId, uint256 amount, uint256 duration, address payee, uint16 feeBps, uint16[3] memory milestoneWeights, bytes calldata operatorSignature) external'
    ]);
    
    const hash = await client.writeContract({
      address: escrowAddress,
      abi: escrowAbi,
      functionName: 'deposit',
      args: [intentId, amount, dur, payee, feeBps, milestones, operatorSignature],
    });

    console.log(`Deposit transaction sent: ${hash}. Waiting for confirmation...`);
    await client.waitForTransactionReceipt({ hash });

    // 4. Sign the Intent ID for Agent Authorization
    console.log('Signing intent for authorization...');
    const authorization = await client.signMessage({
      message: `AgentBureau Intent: ${intentId}`,
    });

    // 5. Retry with payment signature and authorization
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
