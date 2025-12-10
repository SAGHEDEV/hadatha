import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";
import { SuiClient } from '@mysten/sui/client'
import { DEVNET_CHRONO_VAULT_PACKAGE_ID, TESTNET_CHRONO_VAULT_PACKAGE_ID, MAINNET_CHRONO_VAULT_PACKAGE_ID } from "./constant";
const suiClient = new SuiClient({
    url: getFullnodeUrl('testnet'),
});


const { networkConfig, useNetworkVariable, useNetworkVariables } =
    createNetworkConfig({
        devnet: {
            url: getFullnodeUrl("devnet"),
            variables: {
                PackageId: DEVNET_CHRONO_VAULT_PACKAGE_ID,
            },
        },
        testnet: {
            url: getFullnodeUrl("testnet"),
            variables: {
                PackageId: TESTNET_CHRONO_VAULT_PACKAGE_ID,
            },
        },
        mainnet: {
            url: getFullnodeUrl("mainnet"),
            variables: {
                PackageId: MAINNET_CHRONO_VAULT_PACKAGE_ID,
            },
        },
    });


export {
    useNetworkVariable,
    useNetworkVariables,
    networkConfig,
    suiClient,
};