import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
    Bounty: p.createTable(
        {
            id: p.string(),
            creator: p.string(),
            title: p.string(),
            description: p.string(),
            amount: p.bigint(),
            openDeadline: p.bigint(),
            judgingDeadline: p.bigint(),
            slashPercent: p.bigint(),
            status: p.string(),
            selectedWinner: p.string().optional(),
            selectedSubmissionId: p.bigint().optional(),
            totalDeposits: p.bigint(),
            timestamp: p.bigint(),
        },
        {
            creatorIndex: p.index("creator"),
            statusIndex: p.index("status"),
        }
    ),
    Submission: p.createTable(
        {
            id: p.string(),
            bountyId: p.string().references("Bounty.id"),
            submitter: p.string(),
            ipfsCid: p.string(),
            socialHandle: p.string(),
            deposit: p.bigint(),
            timestamp: p.bigint(),
            isWinner: p.boolean(),
        },
        {
            bountyIdIndex: p.index("bountyId"),
            submitterIndex: p.index("submitter"),
        }
    ),
    Quest: p.createTable(
        {
            id: p.string(),
            creator: p.string(),
            title: p.string(),
            description: p.string(),
            totalAmount: p.bigint(),
            perQualifier: p.bigint(),
            maxQualifiers: p.bigint(),
            qualifiersCount: p.int(),
            deadline: p.bigint(),
            createdAt: p.bigint(),
            resolved: p.boolean(),
            cancelled: p.boolean(),
            requirements: p.string(),
            timestamp: p.bigint(),
        },
        {
            creatorIndex: p.index("creator"),
        }
    ),
    QuestEntry: p.createTable(
        {
            id: p.string(),
            questId: p.string().references("Quest.id"),
            solver: p.string(),
            ipfsProofCid: p.string(),
            socialHandle: p.string(),
            timestamp: p.bigint(),
            status: p.int(), // 0=Pending, 1=Approved, 2=Rejected
        },
        {
            questIdIndex: p.index("questId"),
            solverIndex: p.index("solver"),
        }
    ),
    User: p.createTable({
        id: p.string(), // wallet address
        bountiesCreated: p.int(),
        bountiesWon: p.int(),
        totalVolumeCreated: p.bigint(),
        totalVolumeWon: p.bigint(),
        questsCreated: p.int(),
        questsCompleted: p.int(),
    }),
    AgentIdentity: p.createTable(
        {
            id: p.string(),           // network-agentId
            agentId: p.bigint(),
            owner: p.string(),
            agentURI: p.string(),
            active: p.boolean(),
            registeredAt: p.bigint(),
        },
        {
            ownerIndex: p.index("owner"),
        }
    ),
    AgentReputation: p.createTable(
        {
            id: p.string(),           // network-agentId-txHash
            agentId: p.bigint(),
            from: p.string(),
            score: p.bigint(),        // int128 stored as bigint
            tag1: p.string(),
            tag2: p.string(),
            timestamp: p.bigint(),
        },
        {
            agentIdIndex: p.index("agentId"),
            tag1Index: p.index("tag1"),
        }
    ),
}));
