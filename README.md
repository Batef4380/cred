# cred

A room-based engagement economy built on top of X (Twitter). Each room has its own ERC-20 token. Users earn tokens by engaging with posts submitted to the room (like, comment, RT). They spend tokens to submit their own posts or boost others. Engagements are self-reported with a proof link, recorded on-chain. Built on **Monad Testnet**.

**Live:** https://credmonad.vercel.app

## Live deployment (Monad Testnet, chainId 10143)

| Contract | Address |
|---|---|
| IdentityRegistry | `0xf5b44d8F53e8987568EAdA9d5642ea7C97D616af` |
| RoomFactory | `0x8ab4A7259f31bc8C6670A87Fb9D9055C5Ec8D4e6` |
| Monad Blitz Room ($BLITZ) | `0x38aA18BDbD23C6e55243F4B2bCE46e6482Cd923b` |

See [contracts/deployments/monad-testnet.json](contracts/deployments/monad-testnet.json) for the full list.

## Structure

- [`contracts/`](contracts) — Solidity contracts (Foundry): `IdentityRegistry`, `CredToken`, `Room`, `RoomAccess`, `RoomFactory`
- [`frontend/`](frontend) — Next.js 14 (App Router) + Tailwind + wagmi v2 + RainbowKit

## Quick start

### Contracts

```bash
cd contracts
forge install   # pulls forge-std + OpenZeppelin (gitignored, not vendored)
forge build
forge test
```

To redeploy:

```bash
cp .env.example .env   # fill in PRIVATE_KEY
forge script script/Deploy.s.sol --rpc-url monad_testnet --broadcast
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # fill in NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
npm run dev
```

Visit `http://localhost:3000`. The wallet auto-prompts to add/switch to Monad Testnet if it isn't already configured.

## Design

- Primary color `#7F77DD`, flat UI (no gradients/shadows), Tabler icons.
- See [brand.md](brand.md) for the full palette/typography reference.

## How identity works (current state)

Wallets register on-chain via `IdentityRegistry.registerIdentity`. Real X (Twitter) OAuth login is not wired up yet — registration currently uses the wallet's own address as the identity string, so users are shown by their address (e.g. `@0x1234...abCD`) across the app rather than a verified X handle.
