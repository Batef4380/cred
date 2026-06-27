"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRoomAdmin } from "@/hooks/useRoomAdmin";
import { useXHandles } from "@/hooks/useXHandles";
import { ConfigForm } from "@/components/admin/ConfigForm";
import { InviteCodeCard } from "@/components/admin/InviteCodeCard";
import { EngagementsTable } from "@/components/admin/EngagementsTable";

export default function RoomAdminPage({ params }: { params: { roomId: string } }) {
  const roomAddress = params.roomId as `0x${string}`;
  const { isConnected } = useAccount();
  const { admin, isOwner, isLoading, refetch } = useRoomAdmin(roomAddress);

  const engagementUsers = useMemo(() => admin?.engagements.map((e) => e.user) ?? [], [admin]);
  const { getHandle } = useXHandles(engagementUsers);

  if (isLoading || !admin) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-sm text-gray-400">Loading room admin...</p>
      </main>
    );
  }

  if (!isConnected || !isOwner) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <header className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 text-xl font-semibold">
            cred<span className="text-cred-purple">.</span>
          </Link>
          <ConnectButton />
        </header>
        <div className="card p-6 text-center text-sm text-gray-500">
          {isConnected ? "Only the room owner can access this page." : "Connect the room owner's wallet to continue."}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1 text-xl font-semibold">
          cred<span className="text-cred-purple">.</span>
        </Link>
        <ConnectButton />
      </header>

      <Link href={`/rooms/${roomAddress}`} className="mb-1 block text-xs text-gray-400 hover:underline">
        ← Back to room
      </Link>
      <h1 className="mb-6 text-2xl font-semibold">Room admin</h1>

      <div className="flex flex-col gap-5">
        <ConfigForm
          roomAddress={roomAddress}
          pointsPerLike={admin.pointsPerLike}
          pointsPerComment={admin.pointsPerComment}
          pointsPerRT={admin.pointsPerRT}
          postSubmitCost={admin.postSubmitCost}
          onUpdated={refetch}
        />

        {admin.isPrivate && (
          <InviteCodeCard roomAddress={roomAddress} currentInviteCode={admin.currentInviteCode} onGenerated={refetch} />
        )}

        <EngagementsTable
          roomAddress={roomAddress}
          engagements={admin.engagements}
          getHandle={getHandle}
          onPenalized={refetch}
        />
      </div>
    </main>
  );
}
