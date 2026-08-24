"use client";

import { useCallback, useState } from "react";
import { Wallet } from "lucide-react";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export type WalletState = {
  address?: `0x${string}`;
  provider?: EthereumProvider;
  status: "disconnected" | "connecting" | "connected" | "unavailable" | "failed";
  error?: string;
};

export function useMilaWallet() {
  const [wallet, setWallet] = useState<WalletState>({ status: "disconnected" });

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setWallet({ status: "unavailable", error: "No injected wallet provider found." });
      return undefined;
    }
    setWallet({ status: "connecting" });
    try {
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as `0x${string}`[];
      const address = accounts[0];
      if (!address) throw new Error("Wallet returned no account.");
      const next = { address, provider: window.ethereum, status: "connected" as const };
      setWallet(next);
      return next;
    } catch (error) {
      setWallet({ status: "failed", error: error instanceof Error ? error.message : "Wallet connection failed." });
      return undefined;
    }
  }, []);

  return { wallet, connect };
}

export function WalletButton() {
  const { wallet, connect } = useMilaWallet();
  const label = wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : wallet.status === "connecting" ? "Connecting" : "Connect wallet";
  return (
    <button className="wallet-button" type="button" onClick={connect}>
      <Wallet size={16} /> {label}
    </button>
  );
}
