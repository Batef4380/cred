"use client";

import { useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { QRCodeSVG } from "qrcode.react";
import { IconLoader2, IconTicket } from "@tabler/icons-react";
import { abis } from "@/lib/contracts";

const ZERO_BYTES32 = "0x" + "0".repeat(64);

type InviteCodeCardProps = {
  roomAddress: `0x${string}`;
  currentInviteCode: `0x${string}`;
  onGenerated: () => void;
};

export function InviteCodeCard({ roomAddress, currentInviteCode, onGenerated }: InviteCodeCardProps) {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess) onGenerated();
  }, [isSuccess]);

  const isBusy = isPending || isConfirming;
  const hasActiveCode = !!currentInviteCode && currentInviteCode.toLowerCase() !== ZERO_BYTES32;

  function handleGenerate() {
    writeContract({
      address: roomAddress,
      abi: abis.room,
      functionName: "generateInviteCode",
    });
  }

  return (
    <div className="card flex flex-col items-center gap-4 p-5">
      <p className="flex items-center gap-1.5 self-start text-sm font-medium text-gray-900">
        <IconTicket size={16} stroke={1.75} className="text-cred-purple" />
        Invite code
      </p>

      {hasActiveCode ? (
        <>
          <QRCodeSVG value={currentInviteCode} size={160} fgColor="#171717" />
          <p className="break-all text-center text-xs text-gray-400">{currentInviteCode}</p>
        </>
      ) : (
        <p className="text-sm text-gray-400">No active invite code yet.</p>
      )}

      {error && <p className="text-sm text-red-500">Failed to generate. Try again.</p>}

      <button className="btn-primary flex items-center justify-center gap-2 text-sm" disabled={isBusy} onClick={handleGenerate}>
        {isBusy && <IconLoader2 size={16} className="animate-spin" />}
        {isPending ? "Confirm in wallet..." : isConfirming ? "Generating..." : hasActiveCode ? "Regenerate code" : "Generate code"}
      </button>
    </div>
  );
}
