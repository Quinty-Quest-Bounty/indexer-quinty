import { ponder } from "@/generated";

const STATUS_MAP: Record<number, string> = {
    0: "OPEN",
    1: "JUDGING",
    2: "RESOLVED",
    3: "SLASHED",
};

async function getOrCreateUser(User: any, address: string) {
    const id = address.toLowerCase();
    const existing = await User.findUnique({ id });
    if (existing) return existing;
    return await User.create({
        id,
        data: {
            bountiesCreated: 0,
            bountiesWon: 0,
            totalVolumeCreated: 0n,
            totalVolumeWon: 0n,
            questsCreated: 0,
            questsCompleted: 0,
        },
    });
}

// =====================
// QUINTY BOUNTY EVENTS
// =====================

ponder.on("Quinty:BountyCreated", async ({ event, context }) => {
    const { Bounty, User } = context.db;
    const { id, creator, title, amount, openDeadline, judgingDeadline, slashPercent } = event.args;

    try {
        const creatorAddr = creator.toLowerCase();
        const bountyId = `${context.network.name}-${id}`;

        // Read description from contract
        let description = "";
        try {
            const bountyData = await context.client.readContract({
                abi: context.contracts.Quinty.abi,
                address: context.contracts.Quinty.address,
                functionName: "getBounty",
                args: [id],
            });
            description = bountyData[2]; // description is index 2
        } catch (e) {
            console.error(`Failed to read bounty description for ${id}:`, e);
        }

        await Bounty.create({
            id: bountyId,
            data: {
                creator: creatorAddr,
                title,
                description,
                amount,
                openDeadline,
                judgingDeadline,
                slashPercent,
                status: "OPEN",
                totalDeposits: 0n,
                timestamp: event.block.timestamp,
            },
        });

        const user = await getOrCreateUser(User, creatorAddr);
        await User.update({
            id: creatorAddr,
            data: {
                bountiesCreated: user.bountiesCreated + 1,
                totalVolumeCreated: user.totalVolumeCreated + amount,
            },
        });
    } catch (e) {
        console.error(`Error processing BountyCreated ${id}:`, e);
    }
});

ponder.on("Quinty:SubmissionCreated", async ({ event, context }) => {
    const { Submission, Bounty } = context.db;
    const { bountyId, submissionId, submitter, ipfsCid, socialHandle, deposit } = event.args;

    const netBountyId = `${context.network.name}-${bountyId}`;

    await Submission.create({
        id: `${netBountyId}-${submissionId}`,
        data: {
            bountyId: netBountyId,
            submitter: submitter.toLowerCase(),
            ipfsCid,
            socialHandle,
            deposit,
            timestamp: event.block.timestamp,
            isWinner: false,
        },
    });

    // Update totalDeposits on bounty
    try {
        const bounty = await Bounty.findUnique({ id: netBountyId });
        if (bounty) {
            await Bounty.update({
                id: netBountyId,
                data: { totalDeposits: bounty.totalDeposits + deposit },
            });
        }
    } catch (_) {}
});

ponder.on("Quinty:BountyMovedToJudging", async ({ event, context }) => {
    const { Bounty } = context.db;
    const { bountyId } = event.args;

    await Bounty.update({
        id: `${context.network.name}-${bountyId}`,
        data: { status: "JUDGING" },
    });
});

ponder.on("Quinty:WinnerSelected", async ({ event, context }) => {
    const { Bounty, Submission, User } = context.db;
    const { bountyId, winner, submissionId, reward } = event.args;

    const netBountyId = `${context.network.name}-${bountyId}`;
    const winnerAddr = winner.toLowerCase();

    await Bounty.update({
        id: netBountyId,
        data: {
            status: "RESOLVED",
            selectedWinner: winnerAddr,
            selectedSubmissionId: submissionId,
        },
    });

    // Mark winning submission
    try {
        await Submission.update({
            id: `${netBountyId}-${submissionId}`,
            data: { isWinner: true },
        });
    } catch (_) {}

    // Update winner stats
    const user = await getOrCreateUser(User, winnerAddr);
    await User.update({
        id: winnerAddr,
        data: {
            bountiesWon: user.bountiesWon + 1,
            totalVolumeWon: user.totalVolumeWon + reward,
        },
    });
});

ponder.on("Quinty:BountySlashed", async ({ event, context }) => {
    const { Bounty } = context.db;
    const { bountyId } = event.args;

    await Bounty.update({
        id: `${context.network.name}-${bountyId}`,
        data: { status: "SLASHED" },
    });
});

// =====================
// QUEST EVENTS
// =====================

ponder.on("Quest:QuestCreated", async ({ event, context }) => {
    const { Quest, User } = context.db;
    const { id, creator, title, perQualifier, maxQualifiers, deadline } = event.args;

    try {
        const creatorAddr = creator.toLowerCase();
        const questId = `${context.network.name}-${id}`;
        const totalAmount = perQualifier * maxQualifiers;

        // Read full quest data from contract
        let description = "";
        let requirements = "";
        try {
            const questData = await context.client.readContract({
                abi: context.contracts.Quest.abi,
                address: context.contracts.Quest.address,
                functionName: "getQuest",
                args: [id],
            });
            description = questData[2]; // description
            requirements = questData[11]; // requirements
        } catch (e) {
            console.error(`Failed to read quest data for ${id}:`, e);
        }

        await Quest.create({
            id: questId,
            data: {
                creator: creatorAddr,
                title,
                description,
                totalAmount,
                perQualifier,
                maxQualifiers,
                qualifiersCount: 0,
                deadline,
                createdAt: event.block.timestamp,
                resolved: false,
                cancelled: false,
                requirements,
                timestamp: event.block.timestamp,
            },
        });

        const user = await getOrCreateUser(User, creatorAddr);
        await User.update({
            id: creatorAddr,
            data: { questsCreated: user.questsCreated + 1 },
        });
    } catch (e) {
        console.error(`Error processing QuestCreated ${id}:`, e);
    }
});

ponder.on("Quest:EntrySubmitted", async ({ event, context }) => {
    const { QuestEntry } = context.db;
    const { id, solver, ipfsProofCid, socialHandle } = event.args;

    // EntrySubmitted uses quest id as the indexed param, we need to figure out entry index
    // Read entry count to determine the entry ID
    let entryId = 0n;
    try {
        const count = await context.client.readContract({
            abi: context.contracts.Quest.abi,
            address: context.contracts.Quest.address,
            functionName: "getEntryCount",
            args: [id],
        });
        entryId = count - 1n; // latest entry
    } catch (_) {}

    const questId = `${context.network.name}-${id}`;

    await QuestEntry.create({
        id: `${questId}-${entryId}`,
        data: {
            questId,
            solver: solver.toLowerCase(),
            ipfsProofCid,
            socialHandle,
            timestamp: event.block.timestamp,
            status: 0, // Pending
        },
    });
});

ponder.on("Quest:EntryVerified", async ({ event, context }) => {
    const { QuestEntry, Quest } = context.db;
    const { questId, entryId, status } = event.args;

    const netQuestId = `${context.network.name}-${questId}`;

    await QuestEntry.update({
        id: `${netQuestId}-${entryId}`,
        data: { status: Number(status) },
    });

    // If approved, increment qualifiersCount
    if (Number(status) === 1) {
        try {
            const quest = await Quest.findUnique({ id: netQuestId });
            if (quest) {
                await Quest.update({
                    id: netQuestId,
                    data: { qualifiersCount: quest.qualifiersCount + 1 },
                });
            }
        } catch (_) {}
    }
});

ponder.on("Quest:QuestFinalized", async ({ event, context }) => {
    const { Quest, User } = context.db;
    const { id, qualifiers, totalDistributed } = event.args;

    const netQuestId = `${context.network.name}-${id}`;

    await Quest.update({
        id: netQuestId,
        data: { resolved: true },
    });

    // Update qualifier stats
    for (const qualifier of qualifiers) {
        const addr = qualifier.toLowerCase();
        const user = await getOrCreateUser(User, addr);
        await User.update({
            id: addr,
            data: { questsCompleted: user.questsCompleted + 1 },
        });
    }
});

ponder.on("Quest:QuestCancelled", async ({ event, context }) => {
    const { Quest } = context.db;
    const { id } = event.args;

    await Quest.update({
        id: `${context.network.name}-${id}`,
        data: { cancelled: true },
    });
});

// =====================
// ERC-8004 IDENTITY EVENTS
// =====================

ponder.on("IdentityRegistry:Registered", async ({ event, context }) => {
    const { AgentIdentity } = context.db;
    const { agentId, owner, agentURI } = event.args;

    const id = `${context.network.name}-${agentId}`;

    try {
        await AgentIdentity.create({
            id,
            data: {
                agentId,
                owner: owner.toLowerCase(),
                agentURI,
                active: true,
                registeredAt: event.block.timestamp,
            },
        });
    } catch (e) {
        console.error(`Error processing IdentityRegistry:Registered ${agentId}:`, e);
    }
});

ponder.on("IdentityRegistry:Updated", async ({ event, context }) => {
    const { AgentIdentity } = context.db;
    const { agentId, agentURI } = event.args;

    const id = `${context.network.name}-${agentId}`;

    try {
        await AgentIdentity.update({
            id,
            data: { agentURI },
        });
    } catch (e) {
        console.error(`Error processing IdentityRegistry:Updated ${agentId}:`, e);
    }
});

ponder.on("IdentityRegistry:Deregistered", async ({ event, context }) => {
    const { AgentIdentity } = context.db;
    const { agentId } = event.args;

    const id = `${context.network.name}-${agentId}`;

    try {
        await AgentIdentity.update({
            id,
            data: { active: false },
        });
    } catch (e) {
        console.error(`Error processing IdentityRegistry:Deregistered ${agentId}:`, e);
    }
});

// =====================
// ERC-8004 REPUTATION EVENTS
// =====================

ponder.on("ReputationRegistry:NewFeedback", async ({ event, context }) => {
    const { AgentReputation } = context.db;
    const { agentId, from, score, tag1, tag2 } = event.args;

    const id = `${context.network.name}-${agentId}-${event.transaction.hash}`;

    try {
        await AgentReputation.create({
            id,
            data: {
                agentId,
                from: from.toLowerCase(),
                score: BigInt(score),
                tag1,
                tag2,
                timestamp: event.block.timestamp,
            },
        });
    } catch (e) {
        console.error(`Error processing ReputationRegistry:NewFeedback ${agentId}:`, e);
    }
});
