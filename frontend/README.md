# cred frontend

Next.js 14 (App Router) + Tailwind + wagmi v2 + RainbowKit, talking to the Cred contracts on Monad Testnet.

## Setup

```bash
npm install
cp .env.local.example .env.local   # fill in NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
npm run dev
```

`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — free at [cloud.walletconnect.com](https://cloud.walletconnect.com).

Contract addresses + ABIs live in [`src/lib/contracts.ts`](src/lib/contracts.ts) / [`src/lib/abi/`](src/lib/abi/), copied from the Foundry build output in `../contracts`.

## Pages

- `/` — landing + wallet connect / identity registration
- `/rooms` — room list + create room
- `/rooms/[roomId]` — post feed, engagement/boost/submit modals
- `/rooms/[roomId]/admin` — owner-only config, invite codes, penalize
