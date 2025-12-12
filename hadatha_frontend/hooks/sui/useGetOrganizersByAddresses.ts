import { ACCOUNT_ROOT_ID } from "@/lib/constant";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { bcs } from "@mysten/sui/bcs";
import { deriveObjectID } from "@mysten/sui/utils";
import { bytesToString } from "./useGetEventAttendees";

interface OrganizerDetails {
    name: string;
    avatarUrl: string;
    address: string;
}

export const useGetOrganizersByAddresses = (addresses: string[]) => {
    // Keep track of which addresses succeeded
    const addressIdMap = addresses.map(address => {
        try {
            const id = deriveObjectID(
                ACCOUNT_ROOT_ID,
                'address',
                bcs.Address.serialize(address).toBytes(),
            );
            return { address, id };
        } catch (error) {
            console.error(`Failed to derive ID for address ${address}:`, error);
            return { address, id: null };
        }
    });

    const derivedIds = addressIdMap
        .filter(item => item.id !== null)
        .map(item => item.id!);

    const { data, isLoading, error } = useSuiClientQuery(
        "multiGetObjects",
        {
            ids: derivedIds,
            options: { showContent: true }
        },
        { enabled: derivedIds.length > 0 }
    );

    // Map back to original addresses
    const organizers: OrganizerDetails[] = addressIdMap.map(({ address, id }) => {
        if (!id) {
            // Derivation failed - return placeholder
            return {
                name: address.slice(0, 6) + "..." + address.slice(-4),
                avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + address,
                address: address,
            };
        }

        const dataIndex = derivedIds.indexOf(id);
        const accountObject = data?.[dataIndex];

        if (!accountObject?.data?.content || accountObject.data.content.dataType !== "moveObject") {
            return {
                name: address.slice(0, 6) + "..." + address.slice(-4),
                avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + address,
                address: address,
            };
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawFields = accountObject.data.content.fields as unknown as any;

        return {
            name: bytesToString(rawFields.name) || address.slice(0, 6) + "..." + address.slice(-4),
            avatarUrl: bytesToString(rawFields.image_url) || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + address,
            address: address,
        };
    });

    return { organizers, isLoading, error };
};