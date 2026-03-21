/**
 * Minting service: deploys a GalileoToken contract on Base Sepolia.
 *
 * Each product is issued as its own GalileoToken (per-product-token model).
 * The constructor mints the single token to initialOwner — no separate mint() call.
 *
 * Bytecode is loaded from Foundry compilation artifacts
 * (contracts/out/GalileoToken.sol/GalileoToken.json).
 * If the artifact is not found, the function throws with a clear message directing
 * the caller to run `forge build` first.
 *
 * For unit tests, pass the optional `bytecodeOverride` parameter instead of
 * relying on the filesystem artifact.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { GALILEO_TOKEN_ABI } from "./abi.js";
import { BASE_SEPOLIA_CHAIN_ID } from "./chain.js";
import type { MintParams, MintResult } from "./types.js";

/**
 * Attempts to load the compiled GalileoToken bytecode from Foundry artifacts.
 * Returns null if the artifact file is not found or malformed.
 */
function loadGalileoTokenBytecode(): `0x${string}` | null {
  try {
    const artifactUrl = new URL(
      "../../../../../../contracts/out/GalileoToken.sol/GalileoToken.json",
      import.meta.url,
    );
    const content = readFileSync(fileURLToPath(artifactUrl), "utf8");
    const artifact = JSON.parse(content) as {
      bytecode?: { object?: string };
    };
    const hex = artifact?.bytecode?.object;
    if (!hex || hex === "0x") return null;
    return hex as `0x${string}`;
  } catch {
    return null;
  }
}

/**
 * Deploy a new GalileoToken contract on Base Sepolia for one product.
 *
 * @param walletClient  Viem wallet client (with account set) for signing transactions
 * @param publicClient  Viem public client for reading receipts
 * @param params        Product metadata and infrastructure addresses
 * @param bytecodeOverride  Optional compiled bytecode (for testing; omit in production)
 * @returns MintResult with txHash, tokenAddress, chainId
 */
export async function mintProduct(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walletClient: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  publicClient: any,
  params: MintParams,
  bytecodeOverride?: `0x${string}`,
): Promise<MintResult> {
  const bytecode = bytecodeOverride ?? loadGalileoTokenBytecode();

  if (!bytecode) {
    throw new Error(
      "GalileoToken bytecode not found. Run `forge build` in the contracts/ directory to compile.",
    );
  }

  const config = {
    tokenName: params.gtin,
    tokenSymbol: "GLXO",
    productDID: params.productDID,
    productCategory: params.productCategory,
    brandDID: params.brandDID,
    productURI: params.productURI,
    gtin: params.gtin,
    serialNumber: params.serialNumber,
  };

  const txHash: `0x${string}` = await walletClient.deployContract({
    abi: GALILEO_TOKEN_ABI,
    bytecode,
    args: [
      params.admin,
      params.identityRegistry,
      params.compliance,
      config,
      params.initialOwner,
    ],
  });

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
  });

  if (!receipt.contractAddress) {
    throw new Error(
      `Contract deployment receipt for tx ${txHash} is missing contractAddress`,
    );
  }

  return {
    txHash,
    tokenAddress: receipt.contractAddress as `0x${string}`,
    chainId: BASE_SEPOLIA_CHAIN_ID,
  };
}
