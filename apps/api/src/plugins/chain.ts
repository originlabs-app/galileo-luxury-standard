import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChainClient = any;

declare module "fastify" {
  interface FastifyInstance {
    chain: {
      chainEnabled: boolean;
      publicClient: ChainClient;
      walletClient?: ChainClient;
    };
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const deployerKey = process.env.DEPLOYER_PRIVATE_KEY;

  // Always import viem for publicClient (needed for ERC-1271 verification)
  const { createPublicClient, createWalletClient, http } = await import("viem");
  const { baseSepolia } = await import("viem/chains");

  // Always create a publicClient for read-only operations (ERC-1271 verification)
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  if (!deployerKey) {
    fastify.log.warn(
      "Chain write features disabled (no DEPLOYER_PRIVATE_KEY). Read-only publicClient available for ERC-1271.",
    );
    fastify.decorate("chain", {
      chainEnabled: false,
      publicClient,
    });
    return;
  }

  const { privateKeyToAccount } = await import("viem/accounts");
  const account = privateKeyToAccount(deployerKey as `0x${string}`);

  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(),
  });

  fastify.decorate("chain", {
    chainEnabled: true,
    publicClient,
    walletClient,
  });
});
