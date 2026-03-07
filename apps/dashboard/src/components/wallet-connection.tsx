"use client";

import { AlertCircle, LoaderCircle, LogOut, Wallet } from "lucide-react";
import { useMemo } from "react";
import {
  useAccount,
  useConnect,
  useConnectors,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatWalletAddress, walletChain } from "@/lib/wallet";

function resolveErrorMessage(message?: string) {
  if (!message) {
    return null;
  }

  if (message.toLowerCase().includes("provider")) {
    return "Install a browser wallet to connect.";
  }

  return message;
}

export function WalletConnection() {
  const { address, chain, chainId, connector, isConnected } = useAccount();
  const connectors = useConnectors();
  const browserWalletConnector = useMemo(
    () =>
      connectors.find((item) => item.id === "injected") ??
      connectors.find((item) => item.type === "injected") ??
      connectors[0],
    [connectors],
  );
  const {
    connect,
    error: connectError,
    isPending: isConnecting,
  } = useConnect();
  const {
    disconnect,
    error: disconnectError,
    isPending: isDisconnecting,
  } = useDisconnect();
  const {
    switchChain,
    error: switchChainError,
    isPending: isSwitchingChain,
  } = useSwitchChain();

  const isWrongChain = isConnected && chainId !== walletChain.id;
  const errorMessage = resolveErrorMessage(
    connectError?.message ?? switchChainError?.message ?? disconnectError?.message,
  );

  if (!browserWalletConnector) {
    return null;
  }

  if (!isConnected) {
    return (
      <div className="flex items-center gap-3">
        <Button
          className="min-w-36"
          onClick={() =>
            connect({
              chainId: walletChain.id,
              connector: browserWalletConnector,
            })
          }
          disabled={isConnecting}
        >
          {isConnecting ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Wallet />
          )}
          {isConnecting ? "Connecting..." : "Connect wallet"}
        </Button>
        {errorMessage ? (
          <span className="hidden items-center gap-1 text-xs text-destructive lg:inline-flex">
            <AlertCircle className="size-3.5" />
            {errorMessage}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 md:flex">
        <Badge variant={isWrongChain ? "destructive" : "secondary"}>
          {isWrongChain ? "Wrong network" : chain?.name ?? walletChain.name}
        </Badge>
        <span className="text-sm text-foreground">{formatWalletAddress(address)}</span>
        <span className="text-xs text-muted-foreground">
          {connector?.name ?? "Browser wallet"}
        </span>
      </div>

      {isWrongChain ? (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => switchChain({ chainId: walletChain.id })}
          disabled={isSwitchingChain}
        >
          {isSwitchingChain ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <AlertCircle />
          )}
          {isSwitchingChain ? "Switching..." : `Switch to ${walletChain.name}`}
        </Button>
      ) : null}

      <Button
        size="sm"
        variant="outline"
        onClick={() => disconnect()}
        disabled={isDisconnecting}
      >
        {isDisconnecting ? <LoaderCircle className="animate-spin" /> : <LogOut />}
        {isDisconnecting ? "Disconnecting..." : "Disconnect"}
      </Button>
    </div>
  );
}
