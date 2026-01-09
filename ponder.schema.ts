import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
    Bounty: p.createTable({
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
    }),
    Submission: p.createTable({
        id: p.string(),
        bountyId: p.string().references("Bounty.id"),
        solver: p.string(),
        ipfsCid: p.string(),
        timestamp: p.bigint(),
        isWinner: p.boolean(),
        isRevealed: p.boolean(),
    }),
    User: p.createTable({
        id: p.string(), // address
        bountiesCreated: p.int(),
        bountiesWon: p.int(),
        totalVolumeCreated: p.bigint(),
        totalVolumeWon: p.bigint(),
    }),
}));
