"use client";

import { useEffect, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { IconLoader2 } from "@tabler/icons-react";
import { abis } from "@/lib/contracts";
import { shortAddress, displayHandle } from "@/lib/format";
import type { Engagement } from "@/hooks/useRoomAdmin";

const TYPE_LABEL: Record<number, string> = { 1: "Like", 2: "Comment", 3: "RT/Quote" };

type EngagementsTableProps = {
  roomAddress: `0x${string}`;
  engagements: Engagement[];
  getHandle: (address: string) => string;
  onPenalized: () => void;
};

export function EngagementsTable({ roomAddress, engagements, getHandle, onPenalized }: EngagementsTableProps) {
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess) {
      setPendingKey(null);
      onPenalized();
    }
  }, [isSuccess]);

  function handlePenalize(user: `0x${string}`, postId: bigint) {
    setPendingKey(`${user}-${postId}`);
    writeContract({
      address: roomAddress,
      abi: abis.room,
      functionName: "penalize",
      args: [user, postId],
    });
  }

  return (
    <div className="card p-5">
      <p className="mb-3 text-sm font-medium text-gray-900">Engagements</p>

      {error && <p className="mb-2 text-sm text-red-500">Penalize failed. Try again.</p>}

      {engagements.length === 0 ? (
        <p className="text-sm text-gray-400">No engagements yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[1fr_80px_80px_1fr_80px] gap-2 px-2 text-xs text-gray-400">
            <span>User</span>
            <span>Post</span>
            <span>Type</span>
            <span>Proof</span>
            <span></span>
          </div>
          {engagements.map((e) => {
            const key = `${e.user}-${e.postId}`;
            const handle = getHandle(e.user);
            const isRowBusy = pendingKey === key && (isPending || isConfirming);
            return (
              <div
                key={`${key}-${e.timestamp}`}
                className="grid grid-cols-[1fr_80px_80px_1fr_80px] items-center gap-2 rounded-card border border-gray-100 px-2 py-2 text-sm"
              >
                <span className="truncate">{handle ? `@${displayHandle(handle)}` : shortAddress(e.user)}</span>
                <span className="text-gray-500">#{e.postId.toString()}</span>
                <span className="text-gray-500">{TYPE_LABEL[e.engagementType] ?? e.engagementType}</span>
                {e.proofUrl ? (
                  <a href={e.proofUrl} target="_blank" rel="noreferrer" className="truncate text-cred-purple hover:underline">
                    {e.proofUrl}
                  </a>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
                <button
                  className="flex items-center justify-center gap-1 rounded-card border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={isRowBusy}
                  onClick={() => handlePenalize(e.user, e.postId)}
                >
                  {isRowBusy && <IconLoader2 size={12} className="animate-spin" />}
                  Penalize
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
