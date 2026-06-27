"use client";

import { useMemo } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { abis } from "@/lib/contracts";

const TYPES = [1, 2, 3] as const;

export function useEngagementStatus(roomAddress: `0x${string}`, postIds: bigint[]) {
  const { address: account } = useAccount();

  const contracts = useMemo(
    () =>
      account
        ? postIds.flatMap((postId) =>
            TYPES.map((type) => ({
              address: roomAddress,
              abi: abis.room as any,
              functionName: "hasEngagedType",
              args: [postId, account, type],
            }))
          )
        : [],
    [roomAddress, postIds.join(","), account]
  );

  const { data, refetch } = useReadContracts({
    contracts,
    query: { enabled: !!account && postIds.length > 0 },
  });

  function hasEngaged(postId: bigint, type: 1 | 2 | 3) {
    if (!account || !data) return false;
    const postIndex = postIds.findIndex((id) => id === postId);
    if (postIndex === -1) return false;
    const idx = postIndex * TYPES.length + (type - 1);
    return data[idx]?.status === "success" ? (data[idx].result as boolean) : false;
  }

  return { hasEngaged, refetch };
}
