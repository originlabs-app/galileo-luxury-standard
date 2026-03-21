/**
 * Standalone viem client factory for the blockchain service.
 *
 * These helpers create fresh clients independently of the Fastify chain plugin,
 * making the blockchain service unit-testable without a running server.
 *
 * Priority for the private key: MINTING_PRIVATE_KEY → DEPLOYER_PRIVATE_KEY.
 */
import { createPublicClient, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia, getBaseSepoliaTransport } from "./chain.js";

/** Create a public (read-only) viem client for Base Sepolia. */
export function getPublicClient() {
  return createPublicClient({
    chain: baseSepolia,
    transport: getBaseSepoliaTransport(),
  });
}

/**
 * Create a wallet (write) viem client for Base Sepolia.
 * Returns null and logs a warning if no private key is configured.
 */
export function getWalletClient() {
  const privateKey =
    process.env.MINTING_PRIVATE_KEY ?? process.env.DEPLOYER_PRIVATE_KEY;

  if (!privateKey) {
    console.warn(
      "[blockchain] No private key configured (MINTING_PRIVATE_KEY / DEPLOYER_PRIVATE_KEY) — blockchain writes disabled",
    );
    return null;
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  return createWalletClient({
    account,
    chain: baseSepolia,
    transport: getBaseSepoliaTransport(),
  });
}

/**
 * Returns true when both an RPC URL and a private key are configured,
 * meaning the service can submit real transactions.
 */
export function isBlockchainWriteConfigured(): boolean {
  return Boolean(
    (process.env.MINTING_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY) &&
      process.env.BASE_SEPOLIA_RPC_URL,
  );
}
