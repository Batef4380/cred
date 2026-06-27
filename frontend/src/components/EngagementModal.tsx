"use client";

import { useEffect, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { IconX, IconExternalLink, IconLoader2, IconCheck } from "@tabler/icons-react";
import { abis } from "@/lib/contracts";
import type { Post } from "@/hooks/useRoomDetail";

type EngagementOption = { label: string; type: 1 | 2 | 3; points: bigint; needsProof: boolean };

type EngagementModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirmed: () => void;
  roomAddress: `0x${string}`;
  post: Post;
  options: EngagementOption[];
  alreadyEngaged: (type: 1 | 2 | 3) => boolean;
  initialType?: 1 | 2 | 3;
};

export function EngagementModal({
  open,
  onClose,
  onConfirmed,
  roomAddress,
  post,
  options,
  alreadyEngaged,
  initialType,
}: EngagementModalProps) {
  const [selected, setSelected] = useState<EngagementOption | null>(null);
  const [proofUrl, setProofUrl] = useState("");

  const { writeContract, data: txHash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (open) {
      setSelected(options.find((o) => o.type === initialType) ?? null);
      setProofUrl("");
      reset();
    }
  }, [open, initialType]);

  useEffect(() => {
    if (isSuccess) onConfirmed();
  }, [isSuccess]);

  if (!open) return null;

  const proofRequired = selected ? selected.needsProof : false;
  const canConfirm = selected && (!proofRequired || proofUrl.trim().length > 0);

  function handleConfirm() {
    if (!selected || !canConfirm) return;
    writeContract({
      address: roomAddress,
      abi: abis.room,
      functionName: "submitEngagement",
      args: [post.id, selected.type, proofRequired ? proofUrl.trim() : ""],
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="card relative w-full max-w-md p-6">
        <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" onClick={onClose} aria-label="Close">
          <IconX size={20} stroke={1.75} />
        </button>

        <h2 className="mb-1 text-lg font-semibold">Engage with post</h2>

        <a
          href={post.tweetUrl}
          target="_blank"
          rel="noreferrer"
          className="mb-4 flex items-center gap-1 text-sm text-cred-purple hover:underline"
        >
          Open on X <IconExternalLink size={14} stroke={1.75} />
        </a>

        {isSuccess ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <IconCheck size={32} className="text-cred-green" stroke={2} />
            <p className="font-medium">
              +{selected ? Number(selected.points) / 1e18 : 0} pts earned
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              {options.map((opt) => {
                const used = alreadyEngaged(opt.type);
                return (
                  <button
                    key={opt.label}
                    disabled={used || isPending || isConfirming}
                    onClick={() => setSelected(opt)}
                    className={`rounded-card border px-3 py-2 text-sm transition-colors ${
                      selected?.label === opt.label
                        ? "border-cred-purple bg-cred-purple/5 text-cred-purple"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    } ${used ? "cursor-not-allowed opacity-40" : ""}`}
                  >
                    {opt.label} {used ? "(done)" : `+${Number(opt.points) / 1e18}pt`}
                  </button>
                );
              })}
            </div>

            {proofRequired && (
              <input
                className="input"
                placeholder="Proof URL (link to your comment/RT/quote)"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                disabled={isPending || isConfirming}
              />
            )}

            {error && <p className="text-sm text-red-500">Transaction failed. Try again.</p>}

            <button
              className="btn-primary flex items-center justify-center gap-2 text-sm"
              disabled={!canConfirm || isPending || isConfirming}
              onClick={handleConfirm}
            >
              {(isPending || isConfirming) && <IconLoader2 size={16} className="animate-spin" />}
              {isPending ? "Confirm in wallet..." : isConfirming ? "Submitting..." : "Confirm"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export type { EngagementOption };
