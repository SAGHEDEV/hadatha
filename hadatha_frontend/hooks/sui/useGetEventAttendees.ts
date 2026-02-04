/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { REGISTRY_PACKAGE_ID, HADATHA_MODULE, ACCOUNT_ROOT_ID } from "@/lib/constant";
import { deriveObjectID } from '@mysten/sui/utils';
import { bcs } from "@mysten/sui/bcs";

// Helper function to convert vector<u8> to string
export const bytesToString = (bytes: number[]): string => {
    try {
        if (!bytes || bytes.length === 0) return '';
        return new TextDecoder().decode(new Uint8Array(bytes));
    } catch (error) {
        console.error('Error decoding bytes:', error, bytes);
        return '';
    }
};

// Helper function to format timestamp
const formatTimestamp = (timestamp: number): string => {
    if (timestamp === 0) return '';
    return new Date(timestamp).toISOString();
};

export interface ParsedAttendee {
    id: string;
    address: string;
    registrationData: Record<string, string>;
    checkedIn: boolean;
    checkedInAt?: string;
    registeredAt: string;
    nftMinted: boolean;
    ticketTierIndex: number;
}

export interface AttendeeDetails {
    address: string;
    name: string;
    email: string;
    avatarUrl: string;
    registeredAt: string;
    checkedIn: boolean;
    checkedInAt?: string;
    nftMinted: boolean;
    registrationValues: Record<string, string>;
    ticketTierIndex: number;
}

// Main hook to get event attendees from the Table
export const useGetEventAttendeesFromTable = (eventId: string, refetchInterval?: number) => {
    const { data: eventData, isLoading: eventLoading, error: eventError, refetch: refetchEvent } = useSuiClientQuery(
        "getObject",
        {
            id: eventId,
            options: {
                showContent: true,
            }
        },
        {
            enabled: !!eventId,
            refetchInterval,
        }
    );

    // Extract table ID and registration fields from event
    const eventFields = eventData?.data?.content?.dataType === "moveObject"
        ? (eventData.data.content as any).fields
        : null;

    const tableId = eventFields?.attendees?.fields?.id?.id;

    const registrationFields = eventFields?.registration_fields?.map((field: any) => ({
        name: bytesToString(field.name),
        type: bytesToString(field.field_type || field.type),
    })) || [];

    // Get all dynamic fields (attendees) from the table
    const { data: dynamicFields, isLoading: fieldsLoading, error: fieldsError, refetch: refetchFields } = useSuiClientQuery(
        "getDynamicFields",
        {
            parentId: tableId!,
        },
        {
            enabled: !!tableId,
            refetchInterval,
        }
    );

    // Get the object IDs of all attendee entries
    const attendeeObjectIds = dynamicFields?.data?.map(field => field.objectId) || [];

    // Fetch all attendee objects
    const { data: attendeeObjects, isLoading: objectsLoading, error: objectsError, refetch: refetchObjects } = useSuiClientQuery(
        "multiGetObjects",
        {
            ids: attendeeObjectIds,
            options: {
                showContent: true,
            }
        },
        {
            enabled: attendeeObjectIds.length > 0,
            refetchInterval,
        }
    );

    const isLoading = eventLoading || fieldsLoading || objectsLoading;
    const error = eventError || fieldsError || objectsError;

    // Refetch function that triggers all queries
    const refetch = async () => {
        await Promise.all([refetchEvent(), refetchFields(), refetchObjects()]);
    };

    if (isLoading) {
        return {
            attendees: [],
            isLoading: true,
            error: null,
            registrationFields,
            summary: { total: 0, checkedIn: 0, nftMinted: 0 },
            refetch
        };
    }

    if (error) {
        console.error('Error fetching attendees:', error);
        return {
            attendees: [],
            isLoading: false,
            error,
            registrationFields,
            summary: { total: 0, checkedIn: 0, nftMinted: 0 },
            refetch
        };
    }

    if (!attendeeObjects || !dynamicFields || attendeeObjects.length === 0) {
        return {
            attendees: [],
            isLoading: false,
            error: null,
            registrationFields,
            summary: { total: 0, checkedIn: 0, nftMinted: 0 },
            refetch
        };
    }

    try {
        // Parse attendee data
        const attendees: ParsedAttendee[] = [];

        attendeeObjects.forEach((obj, index) => {
            if (obj.data?.content?.dataType === "moveObject") {
                try {
                    const content = obj.data.content as any;
                    const valueFields = content.fields?.value?.fields || content.fields?.value;

                    // Get the address from the dynamic field name
                    const dynamicField = dynamicFields.data[index];
                    const address = dynamicField?.name?.value as string;

                    if (!address || !valueFields) {
                        console.warn('Missing address or value fields for attendee:', index);
                        return;
                    }

                    // Map registration values to field names
                    const registrationData: Record<string, string> = {};
                    const values = valueFields.values || [];

                    values.forEach((value: number[], idx: number) => {
                        if (registrationFields[idx]) {
                            registrationData[registrationFields[idx].name] = bytesToString(value);
                        }
                    });

                    attendees.push({
                        id: address,
                        address,
                        registrationData,
                        checkedIn: valueFields.checked_in || false,
                        checkedInAt: valueFields.checked_in_at && Number(valueFields.checked_in_at) > 0
                            ? formatTimestamp(Number(valueFields.checked_in_at))
                            : undefined,
                        registeredAt: formatTimestamp(Number(valueFields.registered_at || 0)),
                        nftMinted: valueFields.nft_minted || false,
                        ticketTierIndex: Number(valueFields.ticket_tier_index || 0),
                    });
                } catch (err) {
                    console.error('Error parsing single attendee:', err, obj);
                }
            }
        });

        const summary = {
            total: attendees.length,
            checkedIn: attendees.filter(a => a.checkedIn).length,
            nftMinted: attendees.filter(a => a.nftMinted).length,
        };

        return {
            attendees,
            isLoading: false,
            error: null,
            registrationFields,
            summary,
            refetch,
        };
    } catch (error) {
        console.error('Error parsing attendees:', error);
        return {
            attendees: [],
            isLoading: false,
            error: error as Error,
            registrationFields,
            summary: { total: 0, checkedIn: 0, nftMinted: 0 },
            refetch
        };
    }
};

// Enhanced hook that includes account details
export const useGetEventAttendeesWithAccounts = (eventId: string, refetchInterval?: number) => {
    // Get base attendee data
    const {
        attendees: baseAttendees,
        isLoading: attendeesLoading,
        error: attendeesError,
        registrationFields,
        summary,
        refetch: refetchAttendees
    } = useGetEventAttendeesFromTable(eventId, refetchInterval);

    // Extract unique addresses
    const uniqueAddresses = Array.from(new Set(baseAttendees.map(a => a.address)));

    // Derive account IDs
    const accountIdsWithAddress: { id: string; address: string }[] = [];
    uniqueAddresses.forEach(address => {
        try {
            const derivedId = deriveObjectID(
                ACCOUNT_ROOT_ID,
                'address',
                bcs.Address.serialize(address).toBytes(),
            );
            accountIdsWithAddress.push({ id: derivedId, address });
        } catch (error) {
            console.error(`Error deriving account ID for ${address}:`, error);
        }
    });

    const accountIds = accountIdsWithAddress.map(item => item.id);

    // Fetch account objects
    const { data: accountObjects, isLoading: accountsLoading, refetch: refetchAccounts } = useSuiClientQuery(
        "multiGetObjects",
        {
            ids: accountIds,
            options: {
                showContent: true,
            }
        },
        {
            enabled: accountIds.length > 0,
            refetchInterval,
        }
    );

    const isLoading = attendeesLoading || accountsLoading;

    // Refetch function that triggers all queries
    const refetch = async () => {
        await Promise.all([refetchAttendees(), refetchAccounts()]);
    };

    if (isLoading) {
        return {
            attendees: [],
            isLoading: true,
            error: null,
            registrationFields,
            summary: { total: 0, checkedIn: 0, nftMinted: 0 },
            refetch
        };
    }

    if (attendeesError) {
        return {
            attendees: [],
            isLoading: false,
            error: attendeesError,
            registrationFields,
            summary: { total: 0, checkedIn: 0, nftMinted: 0 },
            refetch
        };
    }

    // Create account map
    const accountMap = new Map<string, { name: string; email: string; imageUrl: string }>();
    if (accountObjects) {
        accountObjects.forEach((obj, index) => {
            if (obj.data?.content?.dataType === "moveObject") {
                try {
                    const accFields = obj.data.content.fields as any;
                    const addressMapping = accountIdsWithAddress[index];
                    if (addressMapping) {
                        accountMap.set(addressMapping.address, {
                            name: bytesToString(accFields.name),
                            email: bytesToString(accFields.email),
                            imageUrl: bytesToString(accFields.image_url || []),
                        });
                    }
                } catch (error) {
                    console.error('Error parsing account:', error);
                }
            }
        });
    }

    // Combine attendee data with account info
    const attendeesWithAccounts: AttendeeDetails[] = baseAttendees.map(attendee => {
        const account = accountMap.get(attendee.address);

        return {
            address: attendee.address,
            name: account?.name || attendee.registrationData['Name'] || attendee.registrationData['name'] || `${attendee.address.slice(0, 6)}...${attendee.address.slice(-4)}`,
            email: account?.email || attendee.registrationData['Email'] || attendee.registrationData['email'] || '',
            avatarUrl: account?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(account?.name || attendee.address.slice(0, 6))}&background=random`,
            registeredAt: attendee.registeredAt,
            checkedIn: attendee.checkedIn,
            checkedInAt: attendee.checkedInAt,
            nftMinted: attendee.nftMinted,
            registrationValues: attendee.registrationData,
            ticketTierIndex: attendee.ticketTierIndex,
        };
    });

    return {
        attendees: attendeesWithAccounts,
        isLoading: false,
        error: null,
        registrationFields,
        summary,
        refetch,
    };
};

// Backwards compatibility - export both hooks
export const useGetEventAttendees = useGetEventAttendeesWithAccounts;