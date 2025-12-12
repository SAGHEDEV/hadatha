import { useSuiClientQuery } from "@mysten/dapp-kit";
import { ACCOUNT_ROOT_ID } from "@/lib/constant";
import { bcs } from "@mysten/sui/bcs";
import { deriveObjectID } from '@mysten/sui/utils';
import { bytesToString } from "./useGetAllEvents";

interface RawAccountFields {
    id: { id: string };
    name: number[];
    email: number[];
    image_url: number[];
    total_attended: string | number;
    total_organized: string | number;
    total_hosted: string | number;
    total_registered: string | number;
}

interface OrganizerDetails {
    name: string;
    avatarUrl: string;
    address: string;
}

/**
 * Hook to fetch multiple organizer details by their wallet addresses
 * Used in event preview and event creation
 */
export const useGetOrganizersByAddresses = (addresses: string[]) => {
    // Derive account IDs from wallet addresses
    const derivedIds = addresses.map(address => {
        try {
            return deriveObjectID(
                ACCOUNT_ROOT_ID,
                'address',
                bcs.Address.serialize(address).toBytes(),
            );
        } catch (error) {
            console.error(`Failed to derive ID for address ${address}:`, error);
            return null;
        }
    }).filter(Boolean) as string[];

    // Fetch all account objects
    const { data, isLoading, error } = useSuiClientQuery(
        "multiGetObjects",
        {
            ids: derivedIds,
            options: {
                showContent: true,
            }
        },
        {
            enabled: derivedIds.length > 0,
        }
    );

    // Parse the organizer details
    const organizers: OrganizerDetails[] = addresses.map((address, index) => {
        const accountObject = data?.[index];

        if (!accountObject?.data?.content || accountObject.data.content.dataType !== "moveObject") {
            // Return placeholder if account doesn't exist
            return {
                name: address.slice(0, 6) + "..." + address.slice(-4),
                avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + address,
                address: address,
            };
        }

        const rawFields = accountObject.data.content.fields as unknown as RawAccountFields;

        return {
            name: bytesToString(rawFields.name) || address.slice(0, 6) + "..." + address.slice(-4),
            avatarUrl: bytesToString(rawFields.image_url) || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + address,
            address: address,
        };
    });

    return {
        organizers,
        isLoading,
        error,
    };
};
