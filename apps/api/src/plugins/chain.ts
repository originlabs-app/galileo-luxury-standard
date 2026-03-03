import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChainClient = any;

declare module "fastify" {
  interface FastifyInstance {
    chain: {
      chainEnabled: boolean;
      publicClient?: ChainClient;
      walletClient?: ChainClient;
    };
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const deployerKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!deployerKey) {
    fastify.log.warn("Chain features disabled (no DEPLOYER_PRIVATE_KEY)");
    fastify.decorate("chain", {
      chainEnabled: false,
    });
    return;
  }

  // Dynamic imports to avoid loading viem when chain is disabled
  const { createPublicClient, createWalletClient, http } = await import("viem");
  const { privateKeyToAccount } = await import("viem/accounts");
  const { baseSepolia } = await import("viem/chains");

  const account = privateKeyToAccount(deployerKey as `0x${string}`);

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

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
