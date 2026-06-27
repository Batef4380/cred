"use client";

import { useEffect, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { IconLoader2, IconCheck } from "@tabler/icons-react";
import { abis } from "@/lib/contracts";

type ConfigFormProps = {
  roomAddress: `0x${string}`;
  pointsPerLike: bigint;
  pointsPerComment: bigint;
  pointsPerRT: bigint;
  postSubmitCost: bigint;
  onUpdated: () => void;
};

export function ConfigForm({
  roomAddress,
  pointsPerLike,
  pointsPerComment,
  pointsPerRT,
  postSubmitCost,
  onUpdated,
}: ConfigFormProps) {
  const [like, setLike] = useState((Number(pointsPerLike) / 1e18).toString());
  const [comment, setComment] = useState((Number(pointsPerComment) / 1e18).toString());
  const [rt, setRt] = useState((Number(pointsPerRT) / 1e18).toString());
  const [cost, setCost] = useState((Number(postSubmitCost) / 1e18).toString());

  const { writeContract, data: txHash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess) {
      onUpdated();
    }
  }, [isSuccess]);

  const isBusy = isPending || isConfirming;
  const isValid = [like, comment, rt, cost].every((v) => v.trim() !== "" && !Number.isNaN(Number(v)));

  function handleSave() {
    if (!isValid) return;
    reset();
    writeContract({
      address: roomAddress,
      abi: abis.room,
      functionName: "updateConfig",
      args: [parseUnits(like, 18), parseUnits(comment, 18), parseUnits(rt, 18), parseUnits(cost, 18)],
    });
  }

  return (
    <div className="card p-5">
      <p className="mb-3 text-sm font-medium text-gray-900">Room config</p>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Like points">
          <input className="input" type="number" min="0" value={like} onChange={(e) => setLike(e.target.value)} disabled={isBusy} />
        </Field>
        <Field label="Comment points">
          <input
            className="input"
            type="number"
            min="0"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isBusy}
          />
        </Field>
        <Field label="RT points">
          <input className="input" type="number" min="0" value={rt} onChange={(e) => setRt(e.target.value)} disabled={isBusy} />
        </Field>
        <Field label="Post submit cost">
          <input className="input" type="number" min="0" value={cost} onChange={(e) => setCost(e.target.value)} disabled={isBusy} />
        </Field>
      </div>

      {error && <p className="mt-2 text-sm text-red-500">Update failed. Try again.</p>}

      <button
        className="btn-primary mt-4 flex items-center justify-center gap-2 text-sm"
        disabled={!isValid || isBusy}
        onClick={handleSave}
      >
        {isBusy && <IconLoader2 size={16} className="animate-spin" />}
        {isSuccess && !isBusy && <IconCheck size={16} />}
        {isPending ? "Confirm in wallet..." : isConfirming ? "Saving..." : "Save config"}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-gray-500">{label}</span>
      {children}
    </label>
  );
}
