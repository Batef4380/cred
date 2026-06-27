"use client";

import { useMemo } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { abis } from "@/lib/contracts";

export type Engagement = {
  postId: bigint;
  user: `0x${string}`;
  engagementType: number;
  proofUrl: string;
  timestamp: bigint;
  pointsAwarded: bigint;
};

export function useRoomAdmin(roomAddress: `0x${string}`) {
  const { address: account } = useAccount();

  const contracts: any[] = [
    { address: roomAddress, abi: abis.room as any, functionName: "owner" },
    { address: roomAddress, abi: abis.room as any, functionName: "isPrivate" },
    { address: roomAddress, abi: abis.room as any, functionName: "pointsPerLike" },
    { address: roomAddress, abi: abis.room as any, functionName: "pointsPerComment" },
    { address: roomAddress, abi: abis.room as any, functionName: "pointsPerRT" },
    { address: roomAddress, abi: abis.room as any, functionName: "postSubmitCost" },
    { address: roomAddress, abi: abis.room as any, functionName: "currentInviteCode" },
    { address: roomAddress, abi: abis.room as any, functionName: "getEngagements" },
  ];

  const { data, isLoading, refetch } = useReadContracts({ contracts });

  const admin = useMemo(() => {
    if (!data) return undefined;
    const ok = (i: number) => data[i]?.status === "success";
    if (!ok(0) || !ok(1) || !ok(2) || !ok(3) || !ok(4) || !ok(5) || !ok(6) || !ok(7)) return undefined;

    return {
      owner: data[0].result as `0x${string}`,
      isPrivate: data[1].result as boolean,
      pointsPerLike: data[2].result as bigint,
      pointsPerComment: data[3].result as bigint,
      pointsPerRT: data[4].result as bigint,
      postSubmitCost: data[5].result as bigint,
      currentInviteCode: data[6].result as `0x${string}`,
      engagements: data[7].result as unknown as Engagement[],
    };
  }, [data]);

  const isOwner = !!account && !!admin && account.toLowerCase() === admin.owner.toLowerCase();

  return { admin, isOwner, isLoading, refetch };
}
