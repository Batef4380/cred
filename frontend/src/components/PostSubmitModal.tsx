"use client";

import { useEffect, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { IconX, IconLoader2 } from "@tabler/icons-react";
import { abis } from "@/lib/contracts";
import { formatTokenAmount } from "@/lib/format";

type PostSubmitModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
  roomAddress: `0x${string}`;
  postSubmitCost: bigint;
  symbol: string;
};

export function PostSubmitModal({ open, onClose, onSubmitted, roomAddress, postSubmitCost, symbol }: PostSubmitModalProps) {
  const [tweetUrl, setTweetUrl] = useState("");

  const { writeContract, data: txHash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (!open) {
      setTweetUrl("");
      reset();
    }
  }, [open]);

  useEffect(() => {
    if (isSuccess) {
      onSubmitted();
      onClose();
    }
  }, [isSuccess]);

  if (!open) return null;

  const isValid = /^https?:\/\/(x\.com|twitter\.com)\//.test(tweetUrl.trim());
  const isBusy = isPending || isConfirming;

  function handleSubmit() {
    if (!isValid) return;
    writeContract({
      address: roomAddress,
      abi: abis.room,
      functionName: "submitPost",
      args: [tweetUrl.trim()],
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="card relative w-full max-w-md p-6">
        <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" onClick={onClose} aria-label="Close">
          <IconX size={20} stroke={1.75} />
        </button>

        <h2 className="mb-4 text-lg font-semibold">Submit your post</h2>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Tweet URL</span>
            <input
              className="input"
              placeholder="https://x.com/you/status/..."
              value={tweetUrl}
              onChange={(e) => setTweetUrl(e.target.value)}
              disabled={isBusy}
            />
          </label>

          <p className="text-sm text-gray-500">
            Cost: <span className="font-medium text-gray-900">{formatTokenAmount(postSubmitCost)} ${symbol}</span>
          </p>

          {error && <p className="text-sm text-red-500">Transaction failed. Try again.</p>}

          <button
            className="btn-primary flex items-center justify-center gap-2 text-sm"
            disabled={!isValid || isBusy}
            onClick={handleSubmit}
          >
            {isBusy && <IconLoader2 size={16} className="animate-spin" />}
            {isPending ? "Confirm in wallet..." : isConfirming ? "Submitting..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
