import { createConfig } from "@ponder/core";
import { http } from "viem";

import { QuintyAbi } from "./abis/Quinty";
import { QuestAbi } from "./abis/Quest";
import { QuintyReputationAbi } from "./abis/QuintyReputation";

export default createConfig({
    database: {
        kind: "postgres",
        connectionString: process.env.DATABASE_URL,
    },
    networks: {
        baseSepolia: {
            chainId: 84532,
            transport: http(process.env.PONDER_RPC_URL_84532 || "https://sepolia.base.org"),
        },
    },
    contracts: {
        Quinty: {
            abi: QuintyAbi,
            network: {
                baseSepolia: {
                    address: "0xdB6511DC9869a10Ed00C3706Ff9332820db87463",
                    startBlock: 37200000,
                },
            },
        },
        Quest: {
            abi: QuestAbi,
            network: {
                baseSepolia: {
                    address: "0xFeFAB11BA3Bc2d74B8B4804044f39A12E55BE4ae",
                    startBlock: 37200000,
                },
            },
        },
        QuintyReputation: {
            abi: QuintyReputationAbi,
            network: {
                baseSepolia: {
                    address: "0xE84dA988177707e9e8371894C082049D2C4F5e5e",
                    startBlock: 37200000,
                },
            },
        },
    },
});
