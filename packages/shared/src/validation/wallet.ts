/**
 * Shared wallet validation utilities.
 *
 * @module validation/wallet
 */

/** Matches a valid Ethereum address: 0x followed by 40 hex characters. */
export const ETHEREUM_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

/** Prefix used in the EIP-191 message for wallet linking. */
export const LINK_WALLET_MESSAGE_PREFIX = "Link wallet to Galileo:";

/** Build the full message that must be signed to link a wallet. */
export function buildLinkWalletMessage(email: string): string {
  return `${LINK_WALLET_MESSAGE_PREFIX} ${email}`;
}
