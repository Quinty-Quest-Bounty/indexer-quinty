import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
    Bounty: p.createTable(
        {
            id: p.string(),
            creator: p.string(),
            amount: p.bigint(),
            deadline: p.bigint(),
            status: p.string(),
            description: p.string(),
            title: p.string().optional(),
            requirements: p.string().optional(),
            images: p.string().optional(),
            timestamp: p.bigint(),
            hasOprec: p.boolean(),
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
            solver: p.string(),
            ipfsCid: p.string(),
            timestamp: p.bigint(),
            isWinner: p.boolean(),
            isRevealed: p.boolean(),
        },
        {
            bountyIdIndex: p.index("bountyId"),
            solverIndex: p.index("solver"),
        }
    ),
    User: p.createTable({
        id: p.string(), // wallet address
        bountiesCreated: p.int(),
        bountiesWon: p.int(),
        totalVolumeCreated: p.bigint(),
        totalVolumeWon: p.bigint(),
    }),
}));
