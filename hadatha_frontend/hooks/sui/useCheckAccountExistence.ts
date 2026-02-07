import { ACCOUNT_ROOT_ID } from "@/lib/constant";
import { AccountDetails } from "@/types";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { bcs } from "@mysten/sui/bcs";
import { deriveObjectID, normalizeSuiAddress } from '@mysten/sui/utils';
import { toHEX } from '@mysten/sui/utils';
import { bytesToString } from "./useGetAllEvents";
import { useEffect, useState } from "react";

// Raw account fields as they come from the blockchain (strings are vector<u8>)
interface RawAccountFields {
    id: { id: string };
    name: number[];
    email: number[];
    bio: number[];
    twitter: number[];
    github: number[];
    website: number[];
    image_url: number[];
    owner: number[];
    total_attended: string | number;
    total_organized: string | number;
    total_hosted: string | number;
    total_registered: string | number;
}

export const useGetDerivedAddress = (address?: string) => {
    const account = useCurrentAccount();

    const addressToDerive = address || account?.address;

    // Normalize address to ensure consistency
    const normalizedAddress = addressToDerive ? normalizeSuiAddress(addressToDerive) : null;

    // Derive the address synchronously if account exists
    const derivedAddress = normalizedAddress ? deriveObjectID(
        ACCOUNT_ROOT_ID,
        'address',
        bcs.Address.serialize(normalizedAddress).toBytes(),
    ) : null;

    return derivedAddress;
}

export function useGetDerivedAddresses(addresses: string[]) {
    const [derived, setDerived] = useState<string[]>()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!addresses.length) return

        let cancelled = false

        const deriveAll = async () => {
            setLoading(true)

            try {
                const results = await Promise.all(
                    addresses.map(async (address) => {
                        const derivedAddress = deriveObjectID(
                            ACCOUNT_ROOT_ID,
                            'address',
                            bcs.Address.serialize(address).toBytes(),
                        )
                        return derivedAddress
                    })
                )

                if (!cancelled) {
                    setDerived(results)
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        deriveAll()

        return () => {
            cancelled = true
        }
    }, [addresses])

    return {
        derivedAddresses: derived,
        isLoading: loading,
    }
}



export const useCheckAccountExistence = (address?: string) => {
    // If address is provided, derive THAT address, otherwise use current account's derived address
    const derivedAddress = useGetDerivedAddress(address);

    console.log("Derived address for check:", derivedAddress, "Provider address:", address);

    const { data, isLoading, error, refetch } = useSuiClientQuery(
        "getObject",
        {
            id: (derivedAddress as string) || "",
            options: {
                showContent: true,
            }
        },
        {
            enabled: !!derivedAddress,
            retry: false,
            staleTime: 1000 * 60 * 5, // 5 minutes
        }
    );

    // Account exists if we got data back and it's not an error
    // Note: getObject might throw if object doesn't exist depending on RPC, 
    // or return error field. useSuiClientQuery handles errors.
    // If object doesn't exist, data might be null or contain error.

    const hasAccount = !!data?.data && data.error === undefined;
    const account = data?.data;
    const accountContent = account?.content;
    const rawAccountFields = (accountContent?.dataType === "moveObject") ? (accountContent.fields as unknown as RawAccountFields) : undefined;
    if (!rawAccountFields) {
        return {
            hasAccount,
            isLoading,
            error,
            account: undefined,
            refetch,
        };
    }
    const accountDetails: AccountDetails = {
        id: rawAccountFields.id.id,
                address: normalizeSuiAddress(toHEX(Uint8Array.from(rawAccountFields.owner))),
        name: bytesToString(rawAccountFields.name),
        email: bytesToString(rawAccountFields.email),
        bio: bytesToString(rawAccountFields.bio || []),
        twitter: bytesToString(rawAccountFields.twitter || []),
        github: bytesToString(rawAccountFields.github || []),
        website: bytesToString(rawAccountFields.website || []),
        image_url: bytesToString(rawAccountFields.image_url),
        total_attended: Number(rawAccountFields.total_attended),
        total_organized: Number(rawAccountFields.total_organized),
        total_hosted: Number(rawAccountFields.total_hosted),
        total_registered: Number(rawAccountFields.total_registered),
    }



    console.log("Account existence check:", { hasAccount, account: data?.data });

    return {
        hasAccount,
        isLoading,
        error,
        account: accountDetails,
        refetch,
    };
};