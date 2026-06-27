"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { IconAlertTriangle } from "@tabler/icons-react";
import { MONAD_TESTNET_CHAIN_ID } from "@/lib/contracts";

export function NetworkGuard() {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected || chainId === MONAD_TESTNET_CHAIN_ID) return null;

  return (
    <div className="card flex items-center justify-between gap-3 border-amber-200 bg-amber-50 px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-amber-800">
        <IconAlertTriangle size={18} stroke={1.75} />
        Wrong network. Cred runs on Monad Testnet.
      </div>
      <button
        className="btn-primary text-sm"
        disabled={isPending}
        onClick={() => switchChain({ chainId: MONAD_TESTNET_CHAIN_ID })}
      >
        {isPending ? "Switching..." : "Switch network"}
      </button>
    </div>
  );
}
