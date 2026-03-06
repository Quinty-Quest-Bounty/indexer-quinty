# indexer-quinty

Blockchain event indexer for Quinty smart contracts. Listens to on-chain events and provides a GraphQL API for querying bounties, quests, submissions, and user stats.

## Tech Stack

- Ponder 0.6
- TypeScript
- PostgreSQL
- Viem

## Indexed Contracts

| Contract | Events |
|----------|--------|
| Quinty | BountyCreated, SubmissionCreated, WinnersSelected, BountySlashed |
| Quest | QuestCreated, EntrySubmitted, EntryVerified, QuestFinalized, QuestCancelled |
| QuintyReputation | Achievement minting events |

## Schema

| Table | Key Fields |
|-------|------------|
| Bounty | id, creator, title, amount, status, openDeadline, judgingDeadline |
| Submission | id, bountyId, submitter, ipfsCid, deposit, isWinner |
| Quest | id, creator, title, totalAmount, perQualifier, maxQualifiers, deadline |
| QuestEntry | id, questId, solver, ipfsProofCid, status (Pending/Approved/Rejected) |
| User | id (wallet), bountiesCreated, bountiesWon, questsCreated, questsCompleted |

## Quick Start

```bash
pnpm install
pnpm dev
```

GraphQL playground available at `http://localhost:42069`.

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/indexer
PONDER_RPC_URL_84532=https://sepolia.base.org
```

## Full Documentation

[docs.quinty.io/api-reference/indexer-graphql](https://docs.quinty.io/api-reference/indexer-graphql)
