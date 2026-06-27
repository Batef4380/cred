import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { IdentityOnboarding } from "@/components/IdentityOnboarding";
import { HeroCTAs } from "@/components/landing/HeroCTAs";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { BountyTeaser } from "@/components/landing/BountyTeaser";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-1 text-xl font-semibold">
            cred<span className="text-cred-purple">.</span>
          </Link>
          <nav className="flex items-center gap-5">
            <Link href="/rooms" className="text-sm text-gray-600 hover:text-gray-900">
              Rooms
            </Link>
            <ConnectButton />
          </nav>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-5xl gap-10 px-6 py-16 sm:py-24 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div className="flex flex-col gap-6">
          <span className="badge badge-private w-fit">Live on Monad Testnet</span>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Earn while you engage.
            <br />
            Engage to be seen.
          </h1>
          <p className="max-w-md text-gray-500">
            Cred is a room-based engagement economy built on X. Like, comment,
            and RT posts to earn a room&apos;s token — then spend it to get
            your own posts seen.
          </p>
          <HeroCTAs />
        </div>

        <div id="connect" className="w-full scroll-mt-24 lg:max-w-sm lg:justify-self-end">
          <IdentityOnboarding />
        </div>
      </section>

      <HowItWorks />
      <BountyTeaser />

      <footer className="mt-auto border-t border-gray-100 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-sm text-gray-400 sm:flex-row">
          <span className="flex items-center gap-1">
            cred<span className="text-cred-purple">.</span>
          </span>
          <span>Built on Monad Testnet</span>
        </div>
      </footer>
    </main>
  );
}
