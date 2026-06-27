"use client";

import { IconFlame, IconExternalLink, IconHeart, IconMessageCircle, IconRepeat } from "@tabler/icons-react";
import { initialsFromHandle, shortAddress, displayHandle } from "@/lib/format";
import type { Post } from "@/hooks/useRoomDetail";

type PostCardProps = {
  post: Post;
  authorHandle: string;
  pointsPerLike: bigint;
  pointsPerComment: bigint;
  pointsPerRT: bigint;
  engaged: { like: boolean; comment: boolean; rt: boolean };
  onEngage: (type: 1 | 2 | 3) => void;
  onBoost: () => void;
};

export function PostCard({
  post,
  authorHandle,
  pointsPerLike,
  pointsPerComment,
  pointsPerRT,
  engaged,
  onEngage,
  onBoost,
}: PostCardProps) {
  const displayName = authorHandle ? `@${displayHandle(authorHandle)}` : shortAddress(post.author);

  return (
    <div className="card flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cred-purple/10 text-sm font-semibold text-cred-purple">
            {initialsFromHandle(authorHandle || post.author)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{displayName}</p>
            <p className="text-xs text-gray-400">
              {new Date(Number(post.timestamp) * 1000).toLocaleDateString()}
            </p>
          </div>
        </div>
        {post.boosted && (
          <span className="badge flex items-center gap-1 bg-orange-50 text-orange-600">
            <IconFlame size={12} stroke={2} />
            Boosted
          </span>
        )}
      </div>

      <a
        href={post.tweetUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1 truncate text-sm text-cred-purple hover:underline"
      >
        {post.tweetUrl}
        <IconExternalLink size={13} stroke={1.75} className="shrink-0" />
      </a>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <ActionButton
            icon={<IconHeart size={14} stroke={1.75} />}
            label={`Like +${Number(pointsPerLike) / 1e18}pt`}
            done={engaged.like}
            onClick={() => onEngage(1)}
          />
          <ActionButton
            icon={<IconMessageCircle size={14} stroke={1.75} />}
            label={`Comment +${Number(pointsPerComment) / 1e18}pt`}
            done={engaged.comment}
            onClick={() => onEngage(2)}
          />
          <ActionButton
            icon={<IconRepeat size={14} stroke={1.75} />}
            label={`RT +${Number(pointsPerRT) / 1e18}pt`}
            done={engaged.rt}
            onClick={() => onEngage(3)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={onBoost} className="rounded-card border border-gray-200 px-3 py-1.5 text-xs hover:border-gray-300">
          Boost
        </button>
        <p className="text-xs text-gray-400">{Number(post.totalEngagements)} engagements</p>
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  done,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={done}
      className={`flex items-center gap-1 rounded-card border px-2.5 py-1.5 text-xs transition-colors ${
        done ? "cursor-not-allowed border-gray-100 text-gray-300" : "border-gray-200 text-gray-700 hover:border-gray-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
