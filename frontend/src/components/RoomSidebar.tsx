"use client";

import { IconTrophy, IconRocket } from "@tabler/icons-react";
import { formatTokenAmount, initialsFromHandle, shortAddress, displayHandle } from "@/lib/format";

type LeaderboardEntry = { address: `0x${string}`; balance: bigint; handle: string };

type RoomSidebarProps = {
  balance: bigint;
  symbol: string;
  pointsPerLike: bigint;
  pointsPerComment: bigint;
  pointsPerRT: bigint;
  postSubmitCost: bigint;
  leaderboard: LeaderboardEntry[];
  onSubmitPost: () => void;
  canSubmitPost: boolean;
};

export function RoomSidebar({
  balance,
  symbol,
  pointsPerLike,
  pointsPerComment,
  pointsPerRT,
  postSubmitCost,
  leaderboard,
  onSubmitPost,
  canSubmitPost,
}: RoomSidebarProps) {
  return (
    <aside className="flex flex-col gap-4">
      <div className="card p-5">
        <p className="text-xs text-gray-500">Your balance</p>
        <p className="text-2xl font-semibold">
          {formatTokenAmount(balance)} <span className="text-base text-gray-400">${symbol}</span>
        </p>
      </div>

      <div className="card p-5">
        <p className="mb-3 text-sm font-medium text-gray-900">Point rules</p>
        <div className="flex flex-col gap-1.5 text-sm text-gray-500">
          <div className="flex justify-between">
            <span>Like</span>
            <span className="text-gray-900">+{Number(pointsPerLike) / 1e18} pt</span>
          </div>
          <div className="flex justify-between">
            <span>Comment</span>
            <span className="text-gray-900">+{Number(pointsPerComment) / 1e18} pt</span>
          </div>
          <div className="flex justify-between">
            <span>RT / Quote</span>
            <span className="text-gray-900">+{Number(pointsPerRT) / 1e18} pt</span>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-gray-900">
          <IconTrophy size={16} stroke={1.75} className="text-cred-purple" />
          Leaderboard
        </p>
        <div className="flex flex-col gap-2.5">
          {leaderboard.length === 0 && <p className="text-sm text-gray-400">No members yet.</p>}
          {leaderboard.map((entry, i) => (
            <div key={entry.address} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-4 text-gray-400">{i + 1}</span>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cred-purple/10 text-[10px] font-semibold text-cred-purple">
                  {initialsFromHandle(entry.handle || entry.address)}
                </div>
                <span className="text-gray-700">{entry.handle ? `@${displayHandle(entry.handle)}` : shortAddress(entry.address)}</span>
              </div>
              <span className="text-gray-900">{formatTokenAmount(entry.balance)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <p className="mb-1 text-sm font-medium text-gray-900">Submit your post</p>
        <p className="mb-3 text-xs text-gray-500">
          Costs {formatTokenAmount(postSubmitCost)} ${symbol}
        </p>
        <button className="btn-primary w-full text-sm" disabled={!canSubmitPost} onClick={onSubmitPost}>
          Submit post
        </button>
      </div>

      <div className="card flex items-center justify-between p-5 opacity-60">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <IconRocket size={16} stroke={1.75} />
          Bounty rooms
        </div>
        <span className="badge badge-mock">Soon</span>
      </div>
    </aside>
  );
}
