#!/usr/bin/env node
/**
 * setup-wallet.mjs — Generate or display the Galileo minting wallet.
 *
 * Usage:
 *   node scripts/setup-wallet.mjs
 *
 * Behaviour:
 *   - If MINTING_MNEMONIC is set in the environment, derives and displays
 *     the address from that mnemonic (no new wallet generated).
 *   - Otherwise, generates a fresh BIP-39 mnemonic, derives the account,
 *     and prints the values to copy into apps/api/.env.local.
 *
 * The mnemonic is NEVER written to disk by this script.
 * Copy the output manually into apps/api/.env.local (which is gitignored).
 */

import { generateMnemonic, mnemonicToAccount, english } from "viem/accounts";
import { createPublicClient, formatEther } from "viem";
import { baseSepolia } from "viem/chains";
import { http } from "viem";

// ── Resolve or generate mnemonic ─────────────────────────────────────────────

const existingMnemonic = process.env.MINTING_MNEMONIC;
const mnemonic = existingMnemonic ?? generateMnemonic(english);
const isNew = !existingMnemonic;

const account = mnemonicToAccount(mnemonic);
const address = account.address;

// Derive raw private key from HD key (BIP-44 path m/44'/60'/0'/0/0)
const hdKey = account.getHdKey();
const privateKey = "0x" + Buffer.from(hdKey.privateKey).toString("hex");

// ── Display ───────────────────────────────────────────────────────────────────

console.log("\n" + "─".repeat(60));
console.log(isNew ? "  NEW MINTING WALLET GENERATED" : "  EXISTING MINTING WALLET");
console.log("─".repeat(60));

if (isNew) {
  console.log("\n  ⚠  Save the mnemonic somewhere safe — it will NOT be shown again.");
  console.log("\n  MINTING_MNEMONIC=" + mnemonic);
}

console.log("\n  MINTING_WALLET_ADDRESS=" + address);
console.log("  DEPLOYER_PRIVATE_KEY=" + privateKey);

console.log("\n" + "─".repeat(60));
console.log("  Copy the values above into apps/api/.env.local");
console.log("─".repeat(60) + "\n");

// ── Optional balance check ────────────────────────────────────────────────────

const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
if (rpcUrl) {
  try {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(rpcUrl),
    });
    const balance = await client.getBalance({ address });
    console.log("  Balance on Base Sepolia: " + formatEther(balance) + " ETH");
    if (balance === 0n) {
      console.log("  Faucet: https://faucet.quicknode.com/base/sepolia");
    }
    console.log();
  } catch {
    // Non-fatal — balance check is informational only
  }
}
