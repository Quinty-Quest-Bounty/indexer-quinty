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
    },
    contracts: {
        Quinty: {
            abi: QuintyAbi,
            network: {
                baseSepolia: {
                    address: "0x1c52AAc4f772E2eAbcAb6A0aC7a218d3d5661d85",
                    startBlock: 19000000,
                },
            },
        },
        QuintyReputation: {
            abi: QuintyReputationAbi,
            network: {
                baseSepolia: {
                    address: "0xeA6C17Bafa574f33f2ceCfD64E553A17444e5E94",
                    startBlock: 19000000,
                },
            },
        },
    },
});
