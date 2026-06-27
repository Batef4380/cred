"use client";

import { useEffect, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { IconX, IconLoader2 } from "@tabler/icons-react";
import { abis } from "@/lib/contracts";
import type { Post } from "@/hooks/useRoomDetail";

const PRESETS = [50, 100, 500];

type BoostModalProps = {
  open: boolean;
  onClose: () => void;
  onBoosted: () => void;
  roomAddress: `0x${string}`;
  post: Post;
  symbol: string;
};

export function BoostModal({ open, onClose, onBoosted, roomAddress, post, symbol }: BoostModalProps) {
  const [amount, setAmount] = useState<number>(PRESETS[0]);

  const { writeContract, data: txHash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  useEffect(() => {
    if (isSuccess) {
      onBoosted();
      onClose();
    }
  }, [isSuccess]);

  if (!open) return null;

  const isBusy = isPending || isConfirming;

  function handleConfirm() {
    writeContract({
      address: roomAddress,
      abi: abis.room,
      functionName: "boostPost",
      args: [post.id, parseUnits(amount.toString(), 18)],
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="card relative w-full max-w-md p-6">
        <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" onClick={onClose} aria-label="Close">
          <IconX size={20} stroke={1.75} />
        </button>

        <h2 className="mb-4 text-lg font-semibold">Boost post</h2>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                disabled={isBusy}
                onClick={() => setAmount(preset)}
                className={`rounded-card border px-3 py-2 text-sm transition-colors ${
                  amount === preset
                    ? "border-cred-purple bg-cred-purple/5 text-cred-purple"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                {preset} ${symbol}
              </button>
            ))}
          </div>

          <p className="text-sm text-gray-500">
            95% goes to engagers as bonus rewards, 5% platform fee.
          </p>

          {error && <p className="text-sm text-red-500">Transaction failed. Try again.</p>}

          <button
            className="btn-primary flex items-center justify-center gap-2 text-sm"
            disabled={isBusy}
            onClick={handleConfirm}
          >
            {isBusy && <IconLoader2 size={16} className="animate-spin" />}
            {isPending ? "Confirm in wallet..." : isConfirming ? "Boosting..." : `Boost with ${amount} $${symbol}`}
          </button>
        </div>
      </div>
    </div>
  );
}
