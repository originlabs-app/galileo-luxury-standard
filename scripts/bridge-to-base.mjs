#!/usr/bin/env node
// Bridge ETH from Ethereum Sepolia → Base Sepolia via L1 Standard Bridge
//
// Usage (from project root):
//   node scripts/bridge-to-base.mjs
//
// Prerequisites: viem must be available (it is via the monorepo's pnpm deps)

import { createWalletClient, createPublicClient, http, parseEther, encodeFunctionData, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ──────────────────────────────────────────────────────────────
const BRIDGE_ADDRESS = '0xfd0Bf71F60660E2f608ed56e1659C450eB113120'; // Base L1 Standard Bridge on Sepolia
const AMOUNT_TO_BRIDGE = '0.04'; // ETH (keeping ~0.01 for gas)
const MIN_GAS_LIMIT = 100_000;

// depositETH(uint32 _minGasLimit, bytes _extraData)
const BRIDGE_ABI = [
  {
    name: 'depositETH',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: '_minGasLimit', type: 'uint32' },
      { name: '_extraData', type: 'bytes' },
    ],
    outputs: [],
  },
];

// ── Load private key from .env.local ────────────────────────────────────
const envPath = resolve(__dirname, '../apps/api/.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const pkMatch = envContent.match(/DEPLOYER_PRIVATE_KEY=(0x[0-9a-fA-F]+)/);
if (!pkMatch) throw new Error('Could not find DEPLOYER_PRIVATE_KEY in apps/api/.env.local');

const account = privateKeyToAccount(pkMatch[1]);
console.log(`Wallet address: ${account.address}`);

// ── Create clients ──────────────────────────────────────────────────────
const RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});

const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(RPC_URL),
});

// ── Check balance ───────────────────────────────────────────────────────
const balance = await publicClient.getBalance({ address: account.address });
console.log(`Current Sepolia ETH balance: ${formatEther(balance)} ETH`);

const amountWei = parseEther(AMOUNT_TO_BRIDGE);
if (balance < amountWei) {
  console.error(`Insufficient balance. Need ${AMOUNT_TO_BRIDGE} ETH but have ${formatEther(balance)} ETH`);
  process.exit(1);
}

// ── Send bridge transaction ─────────────────────────────────────────────
console.log(`\nBridging ${AMOUNT_TO_BRIDGE} ETH to Base Sepolia...`);
console.log(`Bridge contract: ${BRIDGE_ADDRESS}`);
console.log(`Min gas limit: ${MIN_GAS_LIMIT}`);

const data = encodeFunctionData({
  abi: BRIDGE_ABI,
  functionName: 'depositETH',
  args: [MIN_GAS_LIMIT, '0x'],
});

const hash = await walletClient.sendTransaction({
  to: BRIDGE_ADDRESS,
  data,
  value: amountWei,
  gas: 200_000n,
});

console.log(`\n✅ Transaction sent!`);
console.log(`TX hash: ${hash}`);
console.log(`Etherscan: https://sepolia.etherscan.io/tx/${hash}`);

// ── Wait for confirmation ───────────────────────────────────────────────
console.log(`\nWaiting for confirmation...`);
const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 120_000 });
console.log(`Block: ${receipt.blockNumber}`);
console.log(`Status: ${receipt.status}`);
console.log(`Gas used: ${receipt.gasUsed}`);

// ── Final balance ───────────────────────────────────────────────────────
const newBalance = await publicClient.getBalance({ address: account.address });
console.log(`\nRemaining Sepolia ETH balance: ${formatEther(newBalance)} ETH`);
console.log(`\nBridge complete! ETH should arrive on Base Sepolia within ~5-10 minutes.`);
console.log(`Check Base Sepolia: https://sepolia.basescan.org/address/${account.address}`);
