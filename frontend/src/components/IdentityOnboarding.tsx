"use client";

import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { IconBrandX, IconCheck, IconLoader2 } from "@tabler/icons-react";
import { useIdentity } from "@/hooks/useIdentity";
import { NetworkGuard } from "@/components/NetworkGuard";
import { displayHandle } from "@/lib/format";

type Step = "connect" | "ready" | "sign" | "register" | "done";

export function IdentityOnboarding() {
  const { isConnected, address } = useAccount();
  const { isRegistered, xHandle, isLoadingHandle, registerIdentity, isWriting, isConfirming, isConfirmed, writeError } =
    useIdentity();
  const { signMessageAsync } = useSignMessage();

  const [step, setStep] = useState<Step>("connect");
  const [signError, setSignError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected) {
      setStep("connect");
    } else if (isRegistered) {
      setStep("done");
    } else if (!isLoadingHandle) {
      setStep((s) => (s === "sign" || s === "register" ? s : "ready"));
    }
  }, [isConnected, isRegistered, isLoadingHandle]);

  useEffect(() => {
    if (isConfirmed) setStep("done");
  }, [isConfirmed]);

  async function handleSignAndRegister() {
    if (!address) return;
    setSignError(null);
    setStep("sign");
    try {
      await signMessageAsync({
        message: `I am linking this wallet to Cred.`,
      });
      setStep("register");
      registerIdentity(address.toLowerCase());
    } catch (err) {
      setSignError("Signature rejected. Try again.");
      setStep("ready");
    }
  }

  if (step === "done") {
    return (
      <div className="card flex items-center gap-2 px-4 py-3 text-sm text-cred-green">
        <IconCheck size={18} stroke={2} />
        Connected as @{displayHandle(xHandle ?? "")}
      </div>
    );
  }

  return (
    <div className="card flex flex-col gap-4 p-6">
      <NetworkGuard />

      {!isConnected ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-600">Step 1 of 2 — connect your wallet</p>
          <ConnectButton />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-600">Step 2 of 2 — confirm and link</p>

          <button
            type="button"
            disabled
            aria-disabled="true"
            title="X login is coming soon"
            className="flex items-center justify-between rounded-card border border-gray-200 px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              <IconBrandX size={16} stroke={1.75} />
              Connect X account
            </span>
            <span className="badge badge-mock">Soon</span>
          </button>

          <p className="text-xs text-gray-400">
            X login isn&apos;t live yet — for now you&apos;ll appear by your wallet address.
          </p>

          {signError && <p className="text-sm text-red-500">{signError}</p>}
          {writeError && <p className="text-sm text-red-500">Registration failed. Try again.</p>}

          <button
            className="btn-primary flex items-center justify-center gap-2 text-sm"
            disabled={step === "sign" || step === "register" || isWriting || isConfirming}
            onClick={handleSignAndRegister}
          >
            {(step === "sign" || step === "register" || isWriting || isConfirming) && (
              <IconLoader2 size={16} className="animate-spin" />
            )}
            {step === "sign"
              ? "Sign message in wallet..."
              : isWriting
              ? "Confirm in wallet..."
              : isConfirming
              ? "Registering on-chain..."
              : "Sign & Continue"}
          </button>
        </div>
      )}
    </div>
  );
}
