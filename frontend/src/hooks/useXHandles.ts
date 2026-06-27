"use client";

import { useMemo } from "react";
import { useReadContracts } from "wagmi";
import { CONTRACTS, abis } from "@/lib/contracts";

export function useXHandles(addresses: `0x${string}`[]) {
  const unique = useMemo(() => Array.from(new Set(addresses)), [addresses.join(",")]);

  const { data, isLoading } = useReadContracts({
    contracts: unique.map((address) => ({
      address: CONTRACTS.identityRegistry,
      abi: abis.identityRegistry as any,
      functionName: "getXHandle",
      args: [address],
    })),
    query: { enabled: unique.length > 0 },
  });

  const handles = useMemo(() => {
    const map = new Map<string, string>();
    unique.forEach((addr, i) => {
      const res = data?.[i];
      map.set(addr.toLowerCase(), res?.status === "success" ? (res.result as string) : "");
    });
    return map;
  }, [data, unique.join(",")]);

  function getHandle(address: string) {
    return handles.get(address.toLowerCase()) || "";
  }

  return { getHandle, isLoading };
}
