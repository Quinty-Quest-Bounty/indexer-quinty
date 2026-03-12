# indexer-quinty

Ponder blockchain indexer for Quinty. Indexes bounty, quest, and ERC-8004 agent identity/reputation events from Base Sepolia. Provides a GraphQL API for querying indexed data.

## Tech Stack

- Ponder 0.6
- TypeScript
- PostgreSQL
- Viem

## Quick Start

```bash
npm install
npm run dev      # Start indexer
npm run build    # Production build
```

GraphQL playground: `http://localhost:42069`

## Indexed Contracts

| Contract | Address | Events |
|----------|---------|--------|
| Quinty | `0xdB6511DC9869a10Ed00C3706Ff9332820db87463` | BountyCreated, SubmissionCreated, BountyMovedToJudging, WinnerSelected, BountySlashed |
| Quest | `0xFeFAB11BA3Bc2d74B8B4804044f39A12E55BE4ae` | QuestCreated, EntrySubmitted, EntryVerified, QuestFinalized, QuestCancelled |
| IdentityRegistry (ERC-8004) | `0x8004A818BFB912233c491871b3d84c89A494BD9e` | Registered, Updated, Deregistered |
| ReputationRegistry (ERC-8004) | `0x8004B663056A597Dffe9eCcC1965A193B7388713` | NewFeedback |

## Schema

| Table | Key Fields |
|-------|------------|
| Bounty | id, creator, title, amount, status, openDeadline, judgingDeadline, totalDeposits |
| Submission | id, bountyId, submitter, ipfsCid, deposit, isWinner |
| Quest | id, creator, title, totalAmount, perQualifier, maxQualifiers, deadline, resolved |
| QuestEntry | id, questId, solver, ipfsProofCid, status (0=Pending, 1=Approved, 2=Rejected) |
| User | id (wallet), bountiesCreated, bountiesWon, questsCreated, questsCompleted |
| AgentIdentity | id, agentId, owner, agentURI, active, registeredAt |
| AgentReputation | id, agentId, from, score, tag1, tag2, timestamp |

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/indexer
PONDER_RPC_URL_84532=https://sepolia.base.org
```

## Full Documentation

[docs.quinty.io/api-reference/indexer-graphql](https://docs.quinty.io/api-reference/indexer-graphql)
