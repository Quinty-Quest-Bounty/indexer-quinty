# indexer-quinty

Ponder blockchain indexer for Quinty — indexes bounty, quest, and ERC-8004 events from Base Sepolia.

## Quick Start

```bash
npm install
npm run dev          # Start indexer (dev mode)
npm run build        # Build for production
npx tsc --noEmit     # Type check
```

## Architecture

```
├── abis/                   # Contract ABI definitions
│   ├── Quinty.ts           # Bounty escrow contract ABI
│   ├── Quest.ts            # Quest contract ABI
│   ├── QuintyReputation.ts # Legacy reputation ABI
│   ├── IdentityRegistry.ts # ERC-8004 Identity Registry ABI
│   └── ReputationRegistry.ts # ERC-8004 Reputation Registry ABI
├── ponder.config.ts        # Network + contract configuration
├── ponder.schema.ts        # Database table definitions
└── src/
    └── index.ts            # Event handlers
```

## Contracts Indexed (Base Sepolia, chainId 84532)

| Contract | Address | Events |
|----------|---------|--------|
| Quinty | `0xdB6511DC9869a10Ed00C3706Ff9332820db87463` | BountyCreated, SubmissionCreated, BountyMovedToJudging, WinnerSelected, BountySlashed |
| Quest | `0xFeFAB11BA3Bc2d74B8B4804044f39A12E55BE4ae` | QuestCreated, EntrySubmitted, EntryVerified, QuestFinalized, QuestCancelled |
| QuintyReputation | `0xE84dA988177707e9e8371894C082049D2C4F5e5e` | (legacy) |
| IdentityRegistry | `0x8004A818BFB912233c491871b3d84c89A494BD9e` | Registered, Updated, Deregistered |
| ReputationRegistry | `0x8004B663056A597Dffe9eCcC1965A193B7388713` | NewFeedback |

All contracts start indexing from block `37200000`.

## Database Tables

| Table | Description |
|-------|-------------|
| Bounty | Bounty metadata, status, deposits, winner |
| Submission | Bounty submissions with IPFS CID and deposit |
| Quest | Quest metadata, qualifier counts, deadlines |
| QuestEntry | Quest entries with proof CID and status |
| User | Aggregated user stats (bounties created/won, quests created/completed) |
| AgentIdentity | ERC-8004 agent identities (NFT id, owner, URI, active status) |
| AgentReputation | ERC-8004 reputation feedback records (score, tags, timestamp) |

## Key Patterns

- **ID format**: `${context.network.name}-${contractId}` (e.g., `baseSepolia-42`)
- **Addresses**: Always lowercased before storage
- **On-chain reads**: `context.client.readContract()` for data not in events (descriptions, entry counts)
- **User upsert**: `getOrCreateUser()` helper creates user record if not exists
- **Error handling**: Event handlers wrap in try/catch, log errors but don't crash

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PONDER_RPC_URL_84532` | Base Sepolia RPC URL (fallback: `https://sepolia.base.org`) |

## Current Branch: `feat/agent-friendly`

### Completed
- Bounty event indexing (create, submit, judge, winner, slash)
- Quest event indexing (create, entry, verify, finalize, cancel)
- ERC-8004 Identity Registry indexing (register, update, deregister)
- ERC-8004 Reputation Registry indexing (feedback)

## Multi-Repo Context

| Repo | Purpose |
|------|---------|
| `fe-quinty` | Next.js 15 frontend |
| `be-quinty` | NestJS backend |
| `landing-quinty` | Vite + React landing page |
| `sc-quinty` | Solidity smart contracts |
| `indexer-quinty` | Ponder blockchain indexer (this repo) |
| `docs` | Mintlify documentation |
