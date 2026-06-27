"use client";

import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import { CONTRACTS, abis } from "@/lib/contracts";

export type OnChainRoom = {
  address: `0x${string}`;
  name: string;
  symbol: string;
  isPrivate: boolean;
  memberCount: number;
  token: `0x${string}`;
};

export function useRoomAddresses() {
  return useReadContract({
    address: CONTRACTS.roomFactory,
    abi: abis.roomFactory,
    functionName: "getRooms",
  });
}

export function useRooms() {
  const { data: roomAddresses, isLoading: isLoadingAddresses, refetch: refetchAddresses } = useRoomAddresses();
  const addresses = (roomAddresses as `0x${string}`[] | undefined) ?? [];

  const baseContracts = useMemo(
    () =>
      addresses.flatMap((address) => [
        { address, abi: abis.room as any, functionName: "name" },
        { address, abi: abis.room as any, functionName: "isPrivate" },
        { address, abi: abis.room as any, functionName: "getMemberCount" },
        { address, abi: abis.room as any, functionName: "token" },
      ]),
    [addresses.join(",")]
  );

  const { data: baseData, isLoading: isLoadingBase } = useReadContracts({
    contracts: baseContracts,
    query: { enabled: addresses.length > 0 },
  });

  const tokenAddresses = useMemo(() => {
    if (!baseData) return [];
    const tokens: `0x${string}`[] = [];
    for (let i = 0; i < addresses.length; i++) {
      const tokenResult = baseData[i * 4 + 3];
      if (tokenResult?.status === "success") tokens.push(tokenResult.result as `0x${string}`);
    }
    return tokens;
  }, [baseData, addresses.length]);

  const symbolContracts = useMemo(
    () => tokenAddresses.map((address) => ({ address, abi: abis.credToken as any, functionName: "symbol" })),
    [tokenAddresses.join(",")]
  );

  const { data: symbolData, isLoading: isLoadingSymbols } = useReadContracts({
    contracts: symbolContracts,
    query: { enabled: tokenAddresses.length > 0 },
  });

  const rooms: OnChainRoom[] = useMemo(() => {
    if (!baseData) return [];
    return addresses
      .map((address, i) => {
        const nameRes = baseData[i * 4];
        const privRes = baseData[i * 4 + 1];
        const memberRes = baseData[i * 4 + 2];
        const tokenRes = baseData[i * 4 + 3];
        if (
          nameRes?.status !== "success" ||
          privRes?.status !== "success" ||
          memberRes?.status !== "success" ||
          tokenRes?.status !== "success"
        ) {
          return null;
        }
        const symbolRes = symbolData?.[i];
        return {
          address,
          name: nameRes.result as string,
          isPrivate: privRes.result as boolean,
          memberCount: Number(memberRes.result as bigint),
          token: tokenRes.result as `0x${string}`,
          symbol: symbolRes?.status === "success" ? (symbolRes.result as string) : "...",
        };
      })
      .filter((r): r is OnChainRoom => r !== null);
  }, [baseData, symbolData, addresses.join(",")]);

  return {
    rooms,
    isLoading: isLoadingAddresses || isLoadingBase || isLoadingSymbols,
    refetch: refetchAddresses,
  };
}
