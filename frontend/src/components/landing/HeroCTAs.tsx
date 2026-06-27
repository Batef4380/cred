"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { IconArrowRight } from "@tabler/icons-react";
import { useIdentity } from "@/hooks/useIdentity";

export function HeroCTAs() {
  const { isConnected } = useAccount();
  const { isRegistered, isLoadingHandle } = useIdentity();

  const ready = isConnected && isRegistered && !isLoadingHandle;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {ready ? (
        <Link href="/rooms" className="btn-primary flex items-center gap-1.5 text-sm">
          Enter rooms
          <IconArrowRight size={16} stroke={2} />
        </Link>
      ) : (
        <a href="#connect" className="btn-primary flex items-center gap-1.5 text-sm">
          Get started
          <IconArrowRight size={16} stroke={2} />
        </a>
      )}
      <Link
        href="/rooms"
        className="rounded-card border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300"
      >
        Browse rooms
      </Link>
    </div>
  );
}
