import { IconRocket } from "@tabler/icons-react";

export function BountyTeaser() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="card flex flex-col items-center gap-3 p-10 text-center opacity-60">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <IconRocket size={20} stroke={1.75} aria-hidden="true" />
        </div>
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-700">Bounty rooms</h3>
          <span className="badge badge-mock">Soon</span>
        </div>
        <p className="max-w-sm text-sm text-gray-500">
          Sponsored rooms with fixed reward pools for specific campaigns. Coming after the testnet phase.
        </p>
      </div>
    </section>
  );
}
