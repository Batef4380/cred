# cred contracts

Foundry project for Cred's smart contracts, deployed to Monad Testnet.

## Setup

```bash
forge install
forge build
forge test
```

`lib/` (forge-std, OpenZeppelin) is gitignored — `forge install` re-fetches them.

## Deploy

```bash
cp .env.example .env   # fill in PRIVATE_KEY
forge script script/Deploy.s.sol --rpc-url monad_testnet --broadcast
```

Deploys `IdentityRegistry` + `RoomFactory`, then creates and seeds the "Monad Blitz" demo room. See [deployments/monad-testnet.json](deployments/monad-testnet.json) for the current live addresses.

## Contracts

- `IdentityRegistry.sol` — wallet ↔ identity, one-to-one
- `CredToken.sol` — ERC-20, mint/burn restricted to its parent `Room`
- `RoomAccess.sol` — invite-code gating for private rooms (inherited by `Room`)
- `Room.sol` — posts, engagements, boost economy, leaderboard, penalties
- `RoomFactory.sol` — deploys `Room` instances (free room creation)
