import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { monadTestnet } from "./chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Cred",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "cred-dev-placeholder",
  chains: [monadTestnet],
  ssr: true,
});
