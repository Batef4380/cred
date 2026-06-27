"use client";

import { useMemo } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { abis } from "@/lib/contracts";

export type Post = {
  id: bigint;
  author: `0x${string}`;
  tweetUrl: string;
  timestamp: bigint;
  totalEngagements: bigint;
  boostPool: bigint;
  boosted: boolean;
};

export function useRoomDetail(roomAddress: `0x${string}`) {
  const { address: account } = useAccount();

  const contracts: any[] = [
    { address: roomAddress, abi: abis.room as any, functionName: "name" },
    { address: roomAddress, abi: abis.room as any, functionName: "token" },
    { address: roomAddress, abi: abis.room as any, functionName: "isPrivate" },
    { address: roomAddress, abi: abis.room as any, functionName: "pointsPerLike" },
    { address: roomAddress, abi: abis.room as any, functionName: "pointsPerComment" },
    { address: roomAddress, abi: abis.room as any, functionName: "pointsPerRT" },
    { address: roomAddress, abi: abis.room as any, functionName: "postSubmitCost" },
    { address: roomAddress, abi: abis.room as any, functionName: "owner" },
    { address: roomAddress, abi: abis.room as any, functionName: "getPosts" },
    { address: roomAddress, abi: abis.room as any, functionName: "getLeaderboard", args: [BigInt(5)] },
    ...(account ? [{ address: roomAddress, abi: abis.room as any, functionName: "isMember", args: [account] }] : []),
  ];

  const { data, isLoading, refetch } = useReadContracts({ contracts });

  const tokenAddress = data?.[1]?.status === "success" ? (data[1].result as `0x${string}`) : undefined;

  const { data: tokenData, refetch: refetchToken } = useReadContracts({
    contracts: tokenAddress
      ? [
          { address: tokenAddress, abi: abis.credToken as any, functionName: "symbol" },
          ...(account
            ? [{ address: tokenAddress, abi: abis.credToken as any, functionName: "balanceOf", args: [account] }]
            : []),
        ]
      : [],
    query: { enabled: !!tokenAddress },
  });

  const room = useMemo(() => {
    if (!data) return undefined;
    const ok = (i: number) => data[i]?.status === "success";
    if (!ok(0) || !ok(2) || !ok(3) || !ok(4) || !ok(5) || !ok(6) || !ok(7) || !ok(8) || !ok(9)) return undefined;

    const [leaderAddrs, leaderBals] = data[9].result as [`0x${string}`[], bigint[]];

    return {
      name: data[0].result as string,
      token: tokenAddress as `0x${string}`,
      isPrivate: data[2].result as boolean,
      pointsPerLike: data[3].result as bigint,
      pointsPerComment: data[4].result as bigint,
      pointsPerRT: data[5].result as bigint,
      postSubmitCost: data[6].result as bigint,
      owner: data[7].result as `0x${string}`,
      posts: data[8].result as unknown as Post[],
      leaderboard: leaderAddrs.map((addr, i) => ({ address: addr, balance: leaderBals[i] })),
      isMember: account && data[10]?.status === "success" ? (data[10].result as boolean) : false,
      symbol: tokenData?.[0]?.status === "success" ? (tokenData[0].result as string) : "...",
      balance:
        account && tokenData?.[1]?.status === "success" ? (tokenData[1].result as bigint) : BigInt(0),
    };
  }, [data, tokenData, tokenAddress, account]);

  return { room, isLoading, refetch, refetchToken };
}
