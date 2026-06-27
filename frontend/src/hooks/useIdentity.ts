"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS, abis } from "@/lib/contracts";

export function useIdentity() {
  const { address } = useAccount();

  const { data: xHandle, isLoading: isLoadingHandle, refetch } = useReadContract({
    address: CONTRACTS.identityRegistry,
    abi: abis.identityRegistry,
    functionName: "getXHandle",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const isRegistered = !!xHandle && xHandle !== "";

  const { writeContract, data: txHash, isPending: isWriting, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  function registerIdentity(handle: string) {
    writeContract({
      address: CONTRACTS.identityRegistry,
      abi: abis.identityRegistry,
      functionName: "registerIdentity",
      args: [handle],
    });
  }

  return {
    xHandle: xHandle as string | undefined,
    isRegistered,
    isLoadingHandle,
    registerIdentity,
    isWriting,
    isConfirming,
    isConfirmed,
    writeError,
    refetchIdentity: refetch,
  };
}
