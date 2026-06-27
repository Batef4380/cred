import { http } from "viem";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { monadTestnet } from "./chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Cred",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "cred-dev-placeholder",
  chains: [monadTestnet],
  // Monad's public testnet RPC rate-limits aggressively (429s). Retry with
  // backoff instead of letting reads/tx-receipt polling fail outright.
  transports: {
    [monadTestnet.id]: http(monadTestnet.rpcUrls.default.http[0], {
      retryCount: 5,
      retryDelay: 500,
    }),
  },
  ssr: true,
});
