import { IconWallet, IconBolt, IconCoin } from "@tabler/icons-react";

const STEPS = [
  {
    icon: IconWallet,
    title: "Connect",
    description: "Link your wallet and X handle. One wallet, one handle — verified on-chain.",
  },
  {
    icon: IconBolt,
    title: "Engage",
    description: "Like, comment, and RT posts in a room. Each engagement is recorded on-chain and earns you tokens.",
  },
  {
    icon: IconCoin,
    title: "Earn & spend",
    description: "Spend tokens to submit your own posts or boost one to the top of the feed.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-20">
      <h2 className="mb-10 text-center text-2xl font-semibold">How it works</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="card flex flex-col gap-3 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cred-purple/10 text-cred-purple">
                  <Icon size={18} stroke={1.75} aria-hidden="true" />
                </div>
                <span className="text-xs font-medium text-gray-400">Step {i + 1}</span>
              </div>
              <h3 className="font-medium text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-500">{step.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
