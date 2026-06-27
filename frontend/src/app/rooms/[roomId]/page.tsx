"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { IconLoader2 } from "@tabler/icons-react";
import { useRoomDetail } from "@/hooks/useRoomDetail";
import { useXHandles } from "@/hooks/useXHandles";
import { useEngagementStatus } from "@/hooks/useEngagementStatus";
import { PostCard } from "@/components/PostCard";
import { RoomSidebar } from "@/components/RoomSidebar";
import { EngagementModal, type EngagementOption } from "@/components/EngagementModal";
import { BoostModal } from "@/components/BoostModal";
import { PostSubmitModal } from "@/components/PostSubmitModal";
import { abis } from "@/lib/contracts";
import type { Post } from "@/hooks/useRoomDetail";

export default function RoomDetailPage({ params }: { params: { roomId: string } }) {
  const roomAddress = params.roomId as `0x${string}`;
  const { address: account, isConnected } = useAccount();

  const { room, isLoading, refetch, refetchToken } = useRoomDetail(roomAddress);

  const allAddresses = useMemo(() => {
    if (!room) return [];
    return [...room.posts.map((p) => p.author), ...room.leaderboard.map((l) => l.address)];
  }, [room]);
  const { getHandle } = useXHandles(allAddresses);

  const postIds = useMemo(() => room?.posts.map((p) => p.id) ?? [], [room]);
  const { hasEngaged, refetch: refetchEngagement } = useEngagementStatus(roomAddress, postIds);

  const [engagePost, setEngagePost] = useState<Post | null>(null);
  const [engageInitialType, setEngageInitialType] = useState<1 | 2 | 3 | undefined>(undefined);
  const [boostPost, setBoostPost] = useState<Post | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);

  const { writeContract: writeJoin, data: joinHash, isPending: isJoinPending, error: joinError, reset: resetJoin } =
    useWriteContract();
  const { isLoading: isJoinConfirming, isSuccess: isJoinSuccess } = useWaitForTransactionReceipt({
    hash: joinHash,
    query: { enabled: !!joinHash },
  });

  function refreshAll() {
    refetch();
    refetchToken();
    refetchEngagement();
  }

  useEffect(() => {
    if (isJoinSuccess) refreshAll();
  }, [isJoinSuccess]);

  function handleJoin() {
    resetJoin();
    writeJoin({
      address: roomAddress,
      abi: abis.room,
      functionName: "joinRoom",
    });
  }

  if (isLoading || !room) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm text-gray-400">Loading room...</p>
      </main>
    );
  }

  const engagementOptions: EngagementOption[] = [
    { label: "Like", type: 1, points: room.pointsPerLike, needsProof: false },
    { label: "Comment", type: 2, points: room.pointsPerComment, needsProof: true },
    { label: "RT", type: 3, points: room.pointsPerRT, needsProof: true },
    { label: "Quote", type: 3, points: room.pointsPerRT, needsProof: true },
  ];

  const needsJoin = isConnected && !room.isMember;
  const isJoinBusy = isJoinPending || isJoinConfirming;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1 text-xl font-semibold">
          cred<span className="text-cred-purple">.</span>
        </Link>
        <ConnectButton />
      </header>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/rooms" className="text-xs text-gray-400 hover:underline">
            ← All rooms
          </Link>
          <h1 className="text-2xl font-semibold">{room.name}</h1>
          <p className="text-sm text-gray-500">${room.symbol}</p>
        </div>
      </div>

      {needsJoin && (
        <div className="card mb-6 flex flex-col gap-2 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-600">Join this room to engage and earn ${room.symbol}.</p>
            <button className="btn-primary flex items-center gap-2 text-sm" disabled={isJoinBusy} onClick={handleJoin}>
              {isJoinBusy && <IconLoader2 size={16} className="animate-spin" />}
              {isJoinPending ? "Confirm in wallet..." : isJoinConfirming ? "Joining..." : "Join Room"}
            </button>
          </div>
          {joinError && (
            <p className="text-sm text-red-500">
              Transaction failed — make sure you've completed wallet setup (Step 2: Sign &amp; Continue) on this address first.
            </p>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          {room.posts.length === 0 && <p className="text-sm text-gray-400">No posts yet.</p>}
          {room.posts
            .slice()
            .sort((a, b) => Number(b.boostPool) - Number(a.boostPool))
            .map((post) => (
              <PostCard
                key={post.id.toString()}
                post={post}
                authorHandle={getHandle(post.author)}
                pointsPerLike={room.pointsPerLike}
                pointsPerComment={room.pointsPerComment}
                pointsPerRT={room.pointsPerRT}
                engaged={{
                  like: hasEngaged(post.id, 1),
                  comment: hasEngaged(post.id, 2),
                  rt: hasEngaged(post.id, 3),
                }}
                onEngage={(type) => {
                  setEngagePost(post);
                  setEngageInitialType(type);
                }}
                onBoost={() => setBoostPost(post)}
              />
            ))}
        </div>

        <RoomSidebar
          balance={room.balance}
          symbol={room.symbol}
          pointsPerLike={room.pointsPerLike}
          pointsPerComment={room.pointsPerComment}
          pointsPerRT={room.pointsPerRT}
          postSubmitCost={room.postSubmitCost}
          leaderboard={room.leaderboard.map((l) => ({ ...l, handle: getHandle(l.address) }))}
          onSubmitPost={() => setSubmitOpen(true)}
          canSubmitPost={isConnected && room.isMember}
        />
      </div>

      {engagePost && (
        <EngagementModal
          open={!!engagePost}
          onClose={() => setEngagePost(null)}
          onConfirmed={refreshAll}
          roomAddress={roomAddress}
          post={engagePost}
          options={engagementOptions}
          alreadyEngaged={(type) => hasEngaged(engagePost.id, type)}
          initialType={engageInitialType}
        />
      )}

      {boostPost && (
        <BoostModal
          open={!!boostPost}
          onClose={() => setBoostPost(null)}
          onBoosted={refreshAll}
          roomAddress={roomAddress}
          post={boostPost}
          symbol={room.symbol}
        />
      )}

      <PostSubmitModal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        onSubmitted={refreshAll}
        roomAddress={roomAddress}
        postSubmitCost={room.postSubmitCost}
        symbol={room.symbol}
      />
    </main>
  );
}
