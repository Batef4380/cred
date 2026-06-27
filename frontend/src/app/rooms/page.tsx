"use client";

import { useState } from "react";
import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRooms } from "@/hooks/useRooms";
import { RoomCard } from "@/components/RoomCard";
import { CreateRoomModal } from "@/components/CreateRoomModal";

export default function RoomsPage() {
  const { rooms, isLoading, refetch } = useRooms();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1 text-xl font-semibold">
          cred<span className="text-cred-purple">.</span>
        </Link>
        <ConnectButton />
      </header>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Rooms</h1>
        <button className="btn-primary flex items-center gap-1.5 text-sm" onClick={() => setCreateOpen(true)}>
          <IconPlus size={16} stroke={2} />
          Create Room
        </button>
      </div>

      {isLoading && rooms.length === 0 ? (
        <p className="text-sm text-gray-400">Loading rooms...</p>
      ) : rooms.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-10 text-center">
          <p className="text-sm text-gray-600">No rooms yet.</p>
          <p className="text-sm text-gray-400">Create the first one to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard
              key={room.address}
              name={room.name}
              symbol={room.symbol}
              memberCount={room.memberCount}
              status={room.isPrivate ? "private" : "live"}
              href={`/rooms/${room.address}`}
            />
          ))}
        </div>
      )}

      <CreateRoomModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => refetch()} />
    </main>
  );
}
