import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";
import { SuiClient } from '@mysten/sui/client'
import { REGISTRY_PACKAGE_ID } from "./constant";

const suiClient = new SuiClient({
    url: getFullnodeUrl('testnet'),
});

const { networkConfig, useNetworkVariable, useNetworkVariables } =
    createNetworkConfig({
        devnet: {
            url: getFullnodeUrl("devnet"),
            variables: {
                PackageId: REGISTRY_PACKAGE_ID,
            },
        },
        testnet: {
            url: getFullnodeUrl("testnet"),
            variables: {
                PackageId: REGISTRY_PACKAGE_ID,
            },
        },
        mainnet: {
            url: getFullnodeUrl("mainnet"),
            variables: {
                PackageId: REGISTRY_PACKAGE_ID,
            },
        },
    });

export {
    useNetworkVariable,
    useNetworkVariables,
    networkConfig,
    suiClient,
};