import { createConfig } from "@ponder/core";
import { http } from "viem";

import { QuintyAbi } from "./abis/Quinty";
import { QuintyReputationAbi } from "./abis/QuintyReputation";

export default createConfig({
    networks: {
        baseSepolia: {
            chainId: 84532,
            transport: http(process.env.PONDER_RPC_URL_84532 || "https://sepolia.base.org"),
        },
        mantleSepolia: {
            chainId: 5003,
            transport: http(process.env.PONDER_RPC_URL_5003 || "https://rpc.sepolia.mantle.xyz"),
        },
        arbitrumSepolia: {
            chainId: 421614,
            transport: http(process.env.PONDER_RPC_URL_421614 || "https://sepolia-rollup.arbitrum.io/rpc"),
        },
    },
    contracts: {
        Quinty: {
            abi: QuintyAbi,
            network: {
                baseSepolia: {
                    address: "0xdB5e489C756D4D2028CCb3515c04DaD134AB03c7",
                    startBlock: 19000000,
                },
                mantleSepolia: {
                    address: "0x0000000000000000000000000000000000000000",
                    startBlock: 19000000,
                },
                arbitrumSepolia: {
                    address: "0x0000000000000000000000000000000000000000",
                    startBlock: 19000000,
                },
            },
        },
        QuintyReputation: {
            abi: QuintyReputationAbi,
            network: {
                baseSepolia: {
                    address: "0xD4c6d0fBe9A1F11e7b6A23E5F857C020B89f0763",
                    startBlock: 19000000,
                },
                mantleSepolia: {
                    address: "0x0000000000000000000000000000000000000000",
                    startBlock: 19000000,
                },
                arbitrumSepolia: {
                    address: "0x0000000000000000000000000000000000000000",
                    startBlock: 19000000,
                },
            },
        },
    },
});
