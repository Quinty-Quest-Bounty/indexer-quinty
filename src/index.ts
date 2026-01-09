import { ponder } from "@/generated";

// Helper to fetch IPFS metadata
async function fetchMetadata(cid: string) {
    if (!cid || cid.length < 20) return null;
    try {
        const response = await fetch(`https://ipfs.io/ipfs/${cid}`, { signal: AbortSignal.timeout(5000) });
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.error(`Error fetching IPFS metadata for ${cid}:`, e);
    }
    return null;
}

ponder.on("Quinty:BountyCreated", async ({ event, context }) => {
    const { Bounty, User } = context.db;
    const { id, creator, amount, deadline, hasOprec } = event.args;

    try {
        const creatorAddr = creator.toLowerCase();
        // Fetch full bounty data from contract to get description (IPFS CID)
        const bountyData = await context.client.readContract({
            abi: context.contracts.Quinty.abi,
            address: context.contracts.Quinty.address,
            functionName: "getBountyData",
            args: [id],
        });

        const descriptionCid = bountyData[1];
        const metadata = await fetchMetadata(descriptionCid);

        await Bounty.create({
            id: `${context.network.name}-${id}`,
            data: {
                creator: creatorAddr,
                amount: amount,
                deadline: deadline,
                status: hasOprec ? "OPREC" : "OPEN",
                description: descriptionCid,
                title: metadata?.title || "",
                requirements: metadata?.requirements ? JSON.stringify(metadata.requirements) : "[]",
                images: metadata?.images ? JSON.stringify(metadata.images) : "[]",
                timestamp: event.block.timestamp,
                hasOprec: hasOprec,
            },
        });

        // Update Creator Stats
        const user = await User.findUnique({ id: creatorAddr });

        if (user) {
            await User.update({
                id: creatorAddr,
                data: {
                    bountiesCreated: user.bountiesCreated + 1,
                    totalVolumeCreated: user.totalVolumeCreated + amount,
                },
            });
        } else {
            await User.create({
                id: creatorAddr,
                data: {
                    bountiesCreated: 1,
                    bountiesWon: 0,
                    totalVolumeCreated: amount,
                    totalVolumeWon: 0n,
                },
            });
        }
    } catch (e) {
        console.error(`Error processing BountyCreated event for ID ${id} on ${context.network.name}:`, e);
    }
});

ponder.on("Quinty:SubmissionCreated", async ({ event, context }) => {
    const { Submission } = context.db;
    const { bountyId, subId, solver, ipfsCid } = event.args;

    await Submission.create({
        id: `${context.network.name}-${bountyId}-${subId}`,
        data: {
            bountyId: `${context.network.name}-${bountyId}`,
            solver: solver.toLowerCase(),
            ipfsCid: ipfsCid,
            timestamp: event.block.timestamp,
            isWinner: false,
            isRevealed: false,
        },
    });
});

ponder.on("Quinty:WinnersSelected", async ({ event, context }) => {
    const { Submission, Bounty } = context.db;
    const { bountyId, winners, submissionIds } = event.args;

    await Bounty.update({
        id: `${context.network.name}-${bountyId}`,
        data: {
            status: "PENDING_REVEAL",
        },
    });

    for (let i = 0; i < winners.length; i++) {
        const subId = submissionIds[i];
        await Submission.update({
            id: `${context.network.name}-${bountyId}-${subId}`,
            data: {
                isWinner: true,
            },
        });
    }
});

ponder.on("Quinty:SolutionRevealed", async ({ event, context }) => {
    const { Submission } = context.db;
    const { bountyId, subId } = event.args;

    await Submission.update({
        id: `${context.network.name}-${bountyId}-${subId}`,
        data: {
            isRevealed: true,
        },
    });
});

ponder.on("Quinty:BountyResolved", async ({ event, context }) => {
    const { Bounty, Submission, User } = context.db;
    const { bountyId } = event.args;

    const bounty = await Bounty.update({
        id: `${context.network.name}-${bountyId}`,
        data: {
            status: "RESOLVED",
        },
    });

    // Update Winner Stats
    const winners = await Submission.findMany({
        where: {
            bountyId: `${context.network.name}-${bountyId}`,
            isWinner: true,
        },
    });

    if (bounty && winners.items.length > 0) {
        const amountPerWinner = bounty.amount / BigInt(winners.items.length);

        for (const winner of winners.items) {
            const userId = winner.solver.toLowerCase();
            const user = await User.findUnique({ id: userId });

            if (user) {
                await User.update({
                    id: userId,
                    data: {
                        bountiesWon: user.bountiesWon + 1,
                        totalVolumeWon: user.totalVolumeWon + amountPerWinner,
                    },
                });
            } else {
                await User.create({
                    id: userId,
                    data: {
                        bountiesCreated: 0,
                        bountiesWon: 1,
                        totalVolumeCreated: 0n,
                        totalVolumeWon: amountPerWinner,
                    },
                });
            }
        }
    }
});

