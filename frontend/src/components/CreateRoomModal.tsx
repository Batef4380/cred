"use client";

import { useEffect, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { IconX, IconLoader2 } from "@tabler/icons-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CONTRACTS, abis } from "@/lib/contracts";
import { NetworkGuard } from "@/components/NetworkGuard";

type CreateRoomModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export function CreateRoomModal({ open, onClose, onCreated }: CreateRoomModalProps) {
  const { isConnected } = useAccount();

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [pointsPerLike, setPointsPerLike] = useState("1");
  const [pointsPerComment, setPointsPerComment] = useState("2");
  const [pointsPerRT, setPointsPerRT] = useState("3");
  const [postSubmitCost, setPostSubmitCost] = useState("5");

  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess) {
      onCreated();
      onClose();
    }
  }, [isSuccess]);

  useEffect(() => {
    if (error) console.error("createRoom failed:", error);
  }, [error]);

  if (!open) return null;

  const isValid = name.trim().length > 0 && symbol.trim().length > 0 && symbol.trim().length <= 8;

  function handleSubmit() {
    if (!isValid) return;
    writeContract({
      address: CONTRACTS.roomFactory,
      abi: abis.roomFactory,
      functionName: "createRoom",
      args: [
        name.trim(),
        symbol.trim().toUpperCase(),
        isPrivate,
        parseUnits(pointsPerLike || "0", 18),
        parseUnits(pointsPerComment || "0", 18),
        parseUnits(pointsPerRT || "0", 18),
        parseUnits(postSubmitCost || "0", 18),
      ],
    });
  }

  const isBusy = isPending || isConfirming;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="card relative w-full max-w-md p-6">
        <button
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Close"
        >
          <IconX size={20} stroke={1.75} />
        </button>

        <h2 className="mb-4 text-lg font-semibold">Create Room</h2>

        <div className="flex flex-col gap-3">
          <NetworkGuard />

          <Field label="Room name">
            <input
              className="input"
              placeholder="Monad Blitz"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isBusy}
            />
          </Field>

          <Field label="Token symbol">
            <input
              className="input"
              placeholder="BLITZ"
              maxLength={8}
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              disabled={isBusy}
            />
          </Field>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Private room</span>
            <button
              type="button"
              onClick={() => setIsPrivate((v) => !v)}
              disabled={isBusy}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                isPrivate ? "bg-cred-purple" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  isPrivate ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Like pts">
              <input
                className="input"
                type="number"
                min="0"
                value={pointsPerLike}
                onChange={(e) => setPointsPerLike(e.target.value)}
                disabled={isBusy}
              />
            </Field>
            <Field label="Comment pts">
              <input
                className="input"
                type="number"
                min="0"
                value={pointsPerComment}
                onChange={(e) => setPointsPerComment(e.target.value)}
                disabled={isBusy}
              />
            </Field>
            <Field label="RT pts">
              <input
                className="input"
                type="number"
                min="0"
                value={pointsPerRT}
                onChange={(e) => setPointsPerRT(e.target.value)}
                disabled={isBusy}
              />
            </Field>
          </div>

          <Field label="Post submit cost">
            <input
              className="input"
              type="number"
              min="0"
              value={postSubmitCost}
              onChange={(e) => setPostSubmitCost(e.target.value)}
              disabled={isBusy}
            />
          </Field>

          {error && (
            <p className="text-sm text-red-500">
              {error.message.length > 200 ? "Transaction failed. Check the console for details." : error.message}
            </p>
          )}

          {!isConnected ? (
            <div className="mt-1">
              <ConnectButton />
            </div>
          ) : (
            <button
              className="btn-primary mt-1 flex items-center justify-center gap-2 text-sm"
              disabled={!isValid || isBusy}
              onClick={handleSubmit}
            >
              {isBusy && <IconLoader2 size={16} className="animate-spin" />}
              {isPending ? "Confirm in wallet..." : isConfirming ? "Creating room..." : "Create Room"}
            </button>
          )}
        </div>
      </div>
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
