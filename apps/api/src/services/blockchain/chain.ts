/**
 * Base Sepolia chain configuration for the Galileo Protocol.
 * Re-exports viem's built-in baseSepolia chain and provides a configured transport.
 */
import { http } from "viem";

export { baseSepolia } from "viem/chains";

/** Canonical Base Sepolia chain ID */
export const BASE_SEPOLIA_CHAIN_ID = 84532;

/** Public RPC fallback when BASE_SEPOLIA_RPC_URL is not configured */
export const BASE_SEPOLIA_PUBLIC_RPC = "https://sepolia.base.org";

/**
 * Returns an HTTP transport for Base Sepolia.
 * Prefers the BASE_SEPOLIA_RPC_URL env var; falls back to the public RPC.
 */
export function getBaseSepoliaTransport() {
  return http(process.env.BASE_SEPOLIA_RPC_URL ?? BASE_SEPOLIA_PUBLIC_RPC);
}
