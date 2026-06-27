import Link from "next/link";
import { IconLock, IconUsers } from "@tabler/icons-react";

type RoomCardProps = {
  name: string;
  symbol: string;
  memberCount: number | string;
  status: "live" | "private" | "mock";
  href?: string;
};

const badgeClass: Record<RoomCardProps["status"], string> = {
  live: "badge-live",
  private: "badge-private",
  mock: "badge-mock",
};

const badgeLabel: Record<RoomCardProps["status"], string> = {
  live: "Live",
  private: "Private",
  mock: "Soon",
};

export function RoomCard({ name, symbol, memberCount, status, href }: RoomCardProps) {
  const content = (
    <div
      className={`card flex flex-col gap-4 p-5 transition-colors ${
        status === "mock" ? "opacity-60" : href ? "hover:border-cred-purple/40" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">${symbol}</p>
        </div>
        <span className={`badge ${badgeClass[status]}`}>
          {status === "private" && <IconLock size={12} className="mr-1" stroke={2} />}
          {badgeLabel[status]}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <IconUsers size={16} stroke={1.75} />
        {memberCount} members
      </div>
    </div>
  );

  if (!href || status === "mock") return content;

  return <Link href={href}>{content}</Link>;
}
