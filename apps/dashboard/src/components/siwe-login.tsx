"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import { useAccount, useConnect, useSignMessage } from "wagmi";
import { injected } from "wagmi/connectors";
import { API_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";

type SiweState = "idle" | "connecting" | "signing" | "verifying" | "error";

function buildSiweMessage(params: {
  domain: string;
  address: string;
  nonce: string;
  chainId: number;
  uri: string;
}): string {
  const issuedAt = new Date().toISOString();
  return [
    `${params.domain} wants you to sign in with your Ethereum account:`,
    params.address,
    "",
    "Sign in to Galileo Protocol",
    "",
    `URI: ${params.uri}`,
    `Version: 1`,
    `Chain ID: ${params.chainId}`,
    `Nonce: ${params.nonce}`,
    `Issued At: ${issuedAt}`,
  ].join("\n");
}

export function SiweLogin() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connectAsync } = useConnect();
  const { signMessageAsync } = useSignMessage();

  const [state, setState] = useState<SiweState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSiweLogin() {
    setState("connecting");
    setErrorMessage(null);

    try {
      // Step 1: Connect wallet if not connected
      let walletAddress = address;
      if (!isConnected || !walletAddress) {
        const result = await connectAsync({ connector: injected() });
        walletAddress = result.accounts[0];
      }

      if (!walletAddress) {
        throw new Error("Could not connect wallet");
      }

      // Step 2: Fetch nonce from API
      setState("signing");
      const nonceRes = await fetch(`${API_URL}/auth/siwe/nonce`, {
        credentials: "include",
      });
      if (!nonceRes.ok) throw new Error("Failed to get nonce");
      const nonceData = await nonceRes.json();
      const nonce = nonceData.data.nonce;

      // Step 3: Build and sign SIWE message
      const domain = window.location.host;
      const uri = window.location.origin;
      const message = buildSiweMessage({
        domain,
        address: walletAddress,
        nonce,
        chainId: 84532, // Base Sepolia
        uri,
      });

      const signature = await signMessageAsync({ message });

      // Step 4: Verify with API
      setState("verifying");
      const verifyRes = await fetch(`${API_URL}/auth/siwe/verify`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Galileo-Client": "dashboard",
        },
        body: JSON.stringify({ message, signature }),
      });

      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        if (data.error?.code === "WALLET_NOT_LINKED") {
          throw new Error(
            "No account linked to this wallet. Login with email first and link your wallet.",
          );
        }
        throw new Error(data.error?.message ?? "SIWE verification failed");
      }

      // Success — redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Wallet login failed",
      );
    }
  }

  const isLoading =
    state === "connecting" || state === "signing" || state === "verifying";
  const buttonLabel = {
    idle: "Sign in with Wallet",
    connecting: "Connecting wallet...",
    signing: "Sign the message...",
    verifying: "Verifying...",
    error: "Sign in with Wallet",
  }[state];

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        size="lg"
        disabled={isLoading}
        onClick={handleSiweLogin}
      >
        <Wallet className="mr-2 size-4" />
        {buttonLabel}
      </Button>
      {errorMessage && (
        <p className="text-center text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
