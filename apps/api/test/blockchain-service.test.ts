/**
 * Unit tests for the blockchain service layer.
 *
 * All viem calls are mocked — no real RPC connections are made.
 * The suite covers:
 *   1. mintProduct — success flow
 *   2. mintProduct — throws when bytecode is missing (no forge build)
 *   3. mintProduct — propagates walletClient.deployContract error
 *   4. mintProduct — throws when receipt has no contractAddress
 *   5. verifyOnChain — success: returns on-chain data
 *   6. verifyOnChain — returns {found:false} when readContract throws
 *   7. getWalletClient — returns null when no private key is configured
 *   8. isBlockchainWriteConfigured — false when env vars are absent
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mock viem before any service imports ──────────────────────────────────────
vi.mock("viem", () => ({
  createPublicClient: vi.fn(),
  createWalletClient: vi.fn(),
  http: vi.fn(() => "mock-transport"),
}));

vi.mock("viem/accounts", () => ({
  privateKeyToAccount: vi.fn(() => ({
    address: "0xDeadBeefDeadBeefDeadBeefDeadBeefDeadBeef",
  })),
  mnemonicToAccount: vi.fn(() => ({
    address: "0xMnemonicMnemonicMnemonicMnemonicMnemonic00",
  })),
}));

vi.mock("viem/chains", () => ({
  baseSepolia: { id: 84532, name: "Base Sepolia" },
}));

// Import services AFTER mocks are registered
import { mintProduct } from "../src/services/blockchain/mint.js";
import { verifyOnChain } from "../src/services/blockchain/verify.js";
import {
  getWalletClient,
  isBlockchainWriteConfigured,
} from "../src/services/blockchain/client.js";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const FAKE_BYTECODE = "0x608060" as `0x${string}`;

const MINT_PARAMS = {
  admin: "0xAdminAdminAdminAdminAdminAdminAdminAdmin00" as `0x${string}`,
  identityRegistry: "0xRegRegRegRegRegRegRegRegRegRegRegRegReg00" as `0x${string}`,
  compliance: "0xCompCompCompCompCompCompCompCompCompComp00" as `0x${string}`,
  productDID: "did:galileo:01:40063813339310:21:SN-001",
  productCategory: "Watches",
  brandDID: "did:galileo:brand:test-brand",
  productURI: "https://galileo.test/01/4006381333931/21/SN-001",
  gtin: "40063813339310",
  serialNumber: "SN-001",
  initialOwner: "0xOwnerOwnerOwnerOwnerOwnerOwnerOwnerOwner00" as `0x${string}`,
};

const FAKE_TX_HASH =
  "0xaabbccddeeff00112233445566778899aabbccddeeff00112233445566778899" as `0x${string}`;
const FAKE_CONTRACT_ADDRESS =
  "0xTokenTokenTokenTokenTokenTokenTokenToken00" as `0x${string}`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeMockWalletClient(
  deployContractResult:
    | `0x${string}`
    | (() => Promise<`0x${string}`> | `0x${string}`)
    | Error = FAKE_TX_HASH,
) {
  return {
    account: {
      address: "0xDeployerDeployerDeployerDeployerDeployerD0" as `0x${string}`,
    },
    deployContract: vi.fn(async () => {
      if (deployContractResult instanceof Error)
        throw deployContractResult;
      if (typeof deployContractResult === "function")
        return deployContractResult();
      return deployContractResult;
    }),
  };
}

function makeMockPublicClient(
  contractAddressInReceipt: `0x${string}` | null = FAKE_CONTRACT_ADDRESS,
  readContractImpl?: (args: { functionName: string }) => unknown,
) {
  return {
    waitForTransactionReceipt: vi.fn(async () => ({
      contractAddress: contractAddressInReceipt,
    })),
    readContract: vi.fn(async (args: { functionName: string }) => {
      if (readContractImpl) return readContractImpl(args);
      const defaults: Record<string, unknown> = {
        productDID: "did:galileo:01:40063813339310:21:SN-001",
        gtin: "40063813339310",
        serialNumber: "SN-001",
        productCategory: "Watches",
        isDecommissioned: false,
      };
      return defaults[args.functionName] ?? null;
    }),
  };
}

// ── Tests: mintProduct ────────────────────────────────────────────────────────

describe("mintProduct", () => {
  it("deploys GalileoToken and returns txHash + tokenAddress + chainId", async () => {
    const walletClient = makeMockWalletClient(FAKE_TX_HASH);
    const publicClient = makeMockPublicClient(FAKE_CONTRACT_ADDRESS);

    const result = await mintProduct(
      walletClient,
      publicClient,
      MINT_PARAMS,
      FAKE_BYTECODE,
    );

    expect(result.txHash).toBe(FAKE_TX_HASH);
    expect(result.tokenAddress).toBe(FAKE_CONTRACT_ADDRESS);
    expect(result.chainId).toBe(84532);
  });

  it("calls deployContract with correct constructor arguments", async () => {
    const walletClient = makeMockWalletClient(FAKE_TX_HASH);
    const publicClient = makeMockPublicClient(FAKE_CONTRACT_ADDRESS);

    await mintProduct(walletClient, publicClient, MINT_PARAMS, FAKE_BYTECODE);

    expect(walletClient.deployContract).toHaveBeenCalledOnce();
    const callArgs = walletClient.deployContract.mock.calls[0]![0] as {
      bytecode: string;
      args: unknown[];
    };
    expect(callArgs.bytecode).toBe(FAKE_BYTECODE);

    // args[0] = admin, args[1] = identityRegistry, args[2] = compliance,
    // args[3] = ProductConfig tuple, args[4] = initialOwner
    const [admin, identityRegistry, compliance, config, initialOwner] =
      callArgs.args as [string, string, string, Record<string, string>, string];
    expect(admin).toBe(MINT_PARAMS.admin);
    expect(identityRegistry).toBe(MINT_PARAMS.identityRegistry);
    expect(compliance).toBe(MINT_PARAMS.compliance);
    expect(config.productDID).toBe(MINT_PARAMS.productDID);
    expect(config.gtin).toBe(MINT_PARAMS.gtin);
    expect(config.serialNumber).toBe(MINT_PARAMS.serialNumber);
    expect(initialOwner).toBe(MINT_PARAMS.initialOwner);
  });

  it("throws when no bytecode is provided and artifact file does not exist", async () => {
    const walletClient = makeMockWalletClient(FAKE_TX_HASH);
    const publicClient = makeMockPublicClient(FAKE_CONTRACT_ADDRESS);

    // No bytecodeOverride → tries to load from file → file not found → throws
    await expect(
      mintProduct(walletClient, publicClient, MINT_PARAMS),
    ).rejects.toThrow(/bytecode not found/i);
  });

  it("propagates errors thrown by walletClient.deployContract", async () => {
    const walletClient = makeMockWalletClient(
      new Error("insufficient funds for gas"),
    );
    const publicClient = makeMockPublicClient(FAKE_CONTRACT_ADDRESS);

    await expect(
      mintProduct(walletClient, publicClient, MINT_PARAMS, FAKE_BYTECODE),
    ).rejects.toThrow("insufficient funds for gas");
  });

  it("throws when the deployment receipt has no contractAddress", async () => {
    const walletClient = makeMockWalletClient(FAKE_TX_HASH);
    const publicClient = makeMockPublicClient(null); // no contractAddress

    await expect(
      mintProduct(walletClient, publicClient, MINT_PARAMS, FAKE_BYTECODE),
    ).rejects.toThrow(/missing contractAddress/i);
  });
});

// ── Tests: verifyOnChain ──────────────────────────────────────────────────────

describe("verifyOnChain", () => {
  it("returns on-chain product data when contract is readable", async () => {
    const publicClient = makeMockPublicClient(
      FAKE_CONTRACT_ADDRESS,
      (args) => {
        const values: Record<string, unknown> = {
          productDID: "did:galileo:01:40063813339310:21:SN-001",
          gtin: "40063813339310",
          serialNumber: "SN-001",
          productCategory: "Watches",
          isDecommissioned: false,
        };
        return values[args.functionName];
      },
    );

    const result = await verifyOnChain(publicClient, FAKE_CONTRACT_ADDRESS);

    expect(result.found).toBe(true);
    expect(result.tokenAddress).toBe(FAKE_CONTRACT_ADDRESS);
    expect(result.productDID).toBe("did:galileo:01:40063813339310:21:SN-001");
    expect(result.gtin).toBe("40063813339310");
    expect(result.serialNumber).toBe("SN-001");
    expect(result.productCategory).toBe("Watches");
    expect(result.isDecommissioned).toBe(false);
  });

  it("returns {found:false} when readContract throws (contract not deployed)", async () => {
    const publicClient = {
      readContract: vi.fn().mockRejectedValue(new Error("call revert exception")),
    };

    const result = await verifyOnChain(
      publicClient,
      "0xDeadDeadDeadDeadDeadDeadDeadDeadDeadDead00" as `0x${string}`,
    );

    expect(result.found).toBe(false);
    expect(result.tokenAddress).toBeUndefined();
  });

  it("calls readContract for all five product fields", async () => {
    const publicClient = makeMockPublicClient();

    await verifyOnChain(publicClient, FAKE_CONTRACT_ADDRESS);

    const calledFunctions = (
      publicClient.readContract.mock.calls as Array<
        [{ functionName: string }]
      >
    ).map(([args]) => args.functionName);

    expect(calledFunctions).toContain("productDID");
    expect(calledFunctions).toContain("gtin");
    expect(calledFunctions).toContain("serialNumber");
    expect(calledFunctions).toContain("productCategory");
    expect(calledFunctions).toContain("isDecommissioned");
  });
});

// ── Tests: getWalletClient (graceful fallback) ────────────────────────────────

describe("getWalletClient", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.MINTING_MNEMONIC;
    delete process.env.MINTING_PRIVATE_KEY;
    delete process.env.DEPLOYER_PRIVATE_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns null when no credential is set", () => {
    const client = getWalletClient();
    expect(client).toBeNull();
  });
});

// ── Tests: isBlockchainWriteConfigured ────────────────────────────────────────

describe("isBlockchainWriteConfigured", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.MINTING_MNEMONIC;
    delete process.env.MINTING_PRIVATE_KEY;
    delete process.env.DEPLOYER_PRIVATE_KEY;
    delete process.env.BASE_SEPOLIA_RPC_URL;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns false when no env vars are set", () => {
    expect(isBlockchainWriteConfigured()).toBe(false);
  });

  it("returns false when only RPC URL is set (no credential)", () => {
    process.env.BASE_SEPOLIA_RPC_URL = "https://sepolia.base.org";
    expect(isBlockchainWriteConfigured()).toBe(false);
  });

  it("returns false when only private key is set (no RPC URL)", () => {
    process.env.MINTING_PRIVATE_KEY =
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    expect(isBlockchainWriteConfigured()).toBe(false);
  });

  it("returns true when both MINTING_PRIVATE_KEY and BASE_SEPOLIA_RPC_URL are set", () => {
    process.env.MINTING_PRIVATE_KEY =
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    process.env.BASE_SEPOLIA_RPC_URL = "https://sepolia.base.org";
    expect(isBlockchainWriteConfigured()).toBe(true);
  });

  it("returns true when both MINTING_MNEMONIC and BASE_SEPOLIA_RPC_URL are set", () => {
    process.env.MINTING_MNEMONIC =
      "test test test test test test test test test test test junk";
    process.env.BASE_SEPOLIA_RPC_URL = "https://sepolia.base.org";
    expect(isBlockchainWriteConfigured()).toBe(true);
  });
});
