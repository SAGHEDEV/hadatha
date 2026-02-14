/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { SuiObjectResponse } from "@mysten/sui/client";
import { REGISTRY_PACKAGE_ID, EVENTS_MODULE, ACCOUNT_ROOT_ID } from "@/lib/constant";
import { deriveObjectID, normalizeSuiAddress } from '@mysten/sui/utils';
import { bcs } from "@mysten/sui/bcs";
import { Event } from "@/types";
import { AttendeeDetails, useGetEventAttendees } from "./useGetEventAttendees";

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

// Helper function to convert timestamp to date string
const timestampToDate = (timestamp: string | number): string => {
    try {
        const ts = Number(timestamp);
        if (isNaN(ts)) return new Date().toISOString();
        return new Date(ts).toISOString();
    } catch (error) {
        console.error('Error converting timestamp:', error, timestamp);
        return new Date().toISOString();
    }
};

// Generate avatar URL from address
const getAvatarUrl = (address: string, name?: string): string => {
    if (name && name.trim()) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    }
    return `https://ui-avatars.com/api/?name=${address.slice(0, 6)}&background=random`;
};

// Get all EventCreated events
export const useGetAllEvents = (refetchInterval?: number) => {
    return useSuiClientQuery("queryEvents", {
        query: {
            MoveEventType: `${REGISTRY_PACKAGE_ID}::${EVENTS_MODULE}::EventCreated`
        },
        order: "descending"
    }, {
        refetchInterval,
    });
};

// Extract event IDs from EventCreated events
const useGetEventIds = (refetchInterval?: number) => {
    const { data, isLoading, error, refetch } = useGetAllEvents(refetchInterval);

    // console.log('Event IDs Query:', { data, isLoading, error });

    const eventIds = data?.data.map((event) => {
        // console.log('Event data:', event);
        const parsedJson = event.parsedJson as { event_id: string };
        // console.log('Parsed event_id:', parsedJson.event_id);
        return parsedJson.event_id;
    }) || [];

    // console.log('Extracted Event IDs:', eventIds);

    return { eventIds, isLoading, error, refetch };
};

// Get all event details
export const useGetAllEventDetails = (refetchInterval?: number) => {
    const { eventIds, isLoading: idsLoading, refetch: refetchIds } = useGetEventIds(refetchInterval);

    // console.log('Event IDs for fetching:', { eventIds, idsLoading, idsError });

    // 1. Fetch all event objects
    const { data: eventDetails, isLoading: eventsLoading, error: eventsError, refetch: refetchEvents } = useSuiClientQuery(
        "multiGetObjects",
        {
            ids: eventIds,
            options: {
                showContent: true,
                showOwner: true,
            }
        },
        {
            enabled: eventIds.length > 0,
            refetchInterval,
        }
    );

    console.log('Event Details Response:', {
        eventDetails,
        eventsLoading,
        eventsError,
        count: eventDetails?.length
    });

    // 2. Extract all unique organizer addresses
    const organizerAddresses = new Set<string>();

    (eventDetails || []).forEach((obj: SuiObjectResponse) => {
        // console.log('Processing event object:', obj);
        if (obj.data?.content?.dataType === "moveObject") {
            const content = obj.data.content as any;
            // console.log('Event content:', content);
            // console.log('Event fields:', content.fields);
            const organizers = content.fields.organizers as string[];
            // console.log('Organizers:', organizers);
            organizers.forEach(address => organizerAddresses.add(address));
        }
    });

    const uniqueOrganizerAddresses = Array.from(organizerAddresses);
    // console.log('Unique organizer addresses:', uniqueOrganizerAddresses);

    // 3. Derive account IDs for all organizers
    const accountIdsWithIndex: { id: string; address: string; index: number }[] = [];
    uniqueOrganizerAddresses.forEach((address, index) => {
        try {
            const derivedId = deriveObjectID(
                ACCOUNT_ROOT_ID,
                'address',
                bcs.Address.serialize(normalizeSuiAddress(address)).toBytes(),
            );
            accountIdsWithIndex.push({ id: derivedId, address, index });
            // console.log(`Derived account ID for ${address}:`, derivedId);
        } catch (error) {
            console.error(`Error deriving account ID for ${address}:`, error);
        }
    });

    const accountIds = accountIdsWithIndex.map(item => item.id);
    // console.log('Account IDs to fetch:', accountIds);

    // 4. Fetch all account objects
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

    // console.log('Account Objects Response:', {
    //     accountObjects,
    //     accountsLoading,
    //     count: accountObjects?.length
    // });

    // Refetch function that triggers all queries
    const refetch = async () => {
        await Promise.all([refetchIds(), refetchEvents(), refetchAccounts()]);
    };

    if (idsLoading || eventsLoading || accountsLoading) {
        // console.log('Still loading:', { idsLoading, eventsLoading, accountsLoading });
        return { events: [], isLoading: true, error: null, refetch };
    }

    if (eventsError) {
        // console.error('Events error:', eventsError);
        return { events: [], isLoading: false, error: eventsError, refetch };
    }

    if (!eventDetails || eventDetails.length === 0) {
        // console.log('No event details found');
        return { events: [], isLoading: false, error: null, refetch };
    }

    // 5. Create a map of address -> AccountDetails
    const accountMap = new Map<string, { name: string; email: string; imageUrl: string }>();

    if (accountObjects) {
        accountObjects.forEach((obj, index) => {
            // console.log(`Processing account object ${index}:`, obj);
            if (obj.data?.content?.dataType === "moveObject") {
                try {
                    const fields = obj.data.content.fields as any;
                    // console.log('Account fields:', fields);
                    const addressMapping = accountIdsWithIndex[index];

                    if (addressMapping) {
                        const accountData = {
                            name: bytesToString(fields.name),
                            email: bytesToString(fields.email),
                            imageUrl: bytesToString(fields.image_url || []),
                        };
                        // console.log(`Mapping account for ${addressMapping.address}:`, accountData);
                        accountMap.set(addressMapping.address, accountData);
                    }
                } catch (error) {
                    console.error('Error parsing account object:', error);
                }
            } else {
                console.log(`Account object ${index} is not a moveObject or doesn't exist`);
            }
        });
    }

    console.log('Final account map:', accountMap);

    // 6. Parse the event details and populate organizers
    const events: Event[] = eventDetails
        .filter((obj: SuiObjectResponse) => {
            const isValid = obj.data?.content?.dataType === "moveObject";
            if (!isValid) {
                console.log('Filtered out invalid event object:', obj);
            }
            return isValid;
        })
        .map((obj: SuiObjectResponse) => {
            try {
                const content = obj.data?.content as any;
                const fields = content.fields;
                // console.log('Parsing event fields:', fields);
                console.log(fields.organizers)

                // Parse organizers with account info
                const organizers = (fields.organizers as string[]).map((address: string) => {
                    const account = accountMap.get(address);
                    // console.log(`Organizer ${address} account:`, account);
                    return {
                        address,
                        name: account?.name || `${address.slice(0, 6)}...${address.slice(-4)}`,
                        avatarUrl: account?.imageUrl || getAvatarUrl(address, account?.name),
                    };
                });

                // Parse the event data
                const event: Event = {
                    id: fields.id.id,
                    title: bytesToString(fields.title),
                    description: bytesToString(fields.description),
                    location: bytesToString(fields.location),
                    start_time: timestampToDate(fields.start_time),
                    end_time: timestampToDate(fields.end_time),
                    date: timestampToDate(fields.start_time),
                    imageUrl: bytesToString(fields.image_url),
                    event_hex: fields.event_hex || (fields.tags.map((tag: number[]) => bytesToString(tag)).find((t: string) => t.startsWith('hex:'))?.replace('hex:', '') || ""),
                    organizers,
                    attendeesCount: Number(fields.attendees_count),
                    checkedInCount: Number(fields.checked_in_count),
                    createdAt: timestampToDate(fields.created_at),
                    updatedAt: timestampToDate(fields.updated_at),
                    registration_fields: fields.registration_fields.map((field: any) => ({
                        name: bytesToString(field.fields.name),
                        type: bytesToString(field.fields.field_type),
                    })),
                    maxAttendees: Number(fields.max_attendees),
                    tags: fields.tags.map((tag: number[]) => bytesToString(tag)),
                    status: bytesToString(fields.status),
                    price: bytesToString(fields.price),
                    allowCheckin: fields.allow_checkin,
                    ticket_tiers: (fields.ticket_tiers || []).map((tier: any) => ({
                        name: bytesToString(tier.fields.name),
                        price: tier.fields.price.toString(),
                        quantity: Number(tier.fields.capacity),
                    })),
                    nft_config: fields.nft_config ? {
                        enabled: !!fields.nft_config.enabled,
                        nft_name: bytesToString(fields.nft_config.nft_name || []),
                        nft_description: bytesToString(fields.nft_config.nft_description || []),
                        nft_image_url: bytesToString(fields.nft_config.nft_image_url || []),
                        total_minted: Number(fields.nft_config.total_minted || 0),
                    } : {
                        enabled: false,
                        nft_name: "",
                        nft_description: "",
                        nft_image_url: "",
                        total_minted: 0,
                    },
                };

                console.log('Parsed event:', event);
                return event;
            } catch (error) {
                console.error('Error parsing event object:', error, obj);
                return null;
            }
        })
        .filter((event): event is Event => event !== null);

    // console.log('Final events:', events);

    return { events, isLoading: false, error: null, refetch };
};

// Get a single event by ID with organizer details
export const useGetEventById = (eventId: string, refetchInterval?: number) => {
    console.log('Fetching event by ID:', eventId);

    const { data, isLoading, error, refetch: refetchEvent } = useSuiClientQuery(
        "getObject",
        {
            id: eventId,
            options: {
                showContent: true,
                showOwner: true,
            }
        },
        {
            enabled: !!eventId,
            refetchInterval,
        }
    );

    console.log('Single event query result:', { data, isLoading, error });
    console.log('Event data content:', data?.data?.content);

    console.log(data)
    // Extract organizer addresses
    const organizerAddresses = data?.data?.content?.dataType === "moveObject"
        ? ((data.data.content as any).fields.organizers as string[])
        : [];
    console.log(organizerAddresses)

    console.log('Organizer addresses from event:', organizerAddresses);

    // Derive account IDs
    const accountIdsWithAddress: { id: string; address: string }[] = [];
    organizerAddresses.forEach(address => {
        try {
            const derivedId = deriveObjectID(
                ACCOUNT_ROOT_ID,
                'address',
                bcs.Address.serialize(normalizeSuiAddress(address)).toBytes(),
            );
            accountIdsWithAddress.push({ id: derivedId, address });
            console.log(`Derived account ID for ${address}:`, derivedId);
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

    console.log('Account objects for single event:', { accountObjects, accountsLoading });

    // Refetch function that triggers all queries
    const refetch = async () => {
        await Promise.all([refetchEvent(), refetchAccounts()]);
    };

    if (isLoading || accountsLoading) {
        return { event: null, isLoading: true, error, refetch };
    }

    if (!data || data.data?.content?.dataType !== "moveObject") {
        console.error('Invalid event data:', data);
        return { event: null, isLoading: false, error: error || new Error("Invalid object type"), refetch };
    }

    const content = data.data.content as any;
    const fields = content.fields;

    // Create account map
    const accountMap = new Map<string, { name: string; email: string; imageUrl: string }>();
    if (accountObjects) {
        accountObjects.forEach((obj, index) => {
            if (obj.data?.content?.dataType === "moveObject") {
                try {
                    const accFields = obj.data.content.fields as any;
                    const addressMapping = accountIdsWithAddress[index];
                    accountMap.set(addressMapping.address, {
                        name: bytesToString(accFields.name),
                        email: bytesToString(accFields.email),
                        imageUrl: bytesToString(accFields.image_url || []),
                    });
                } catch (error) {
                    console.error('Error parsing account:', error);
                }
            }
        });
    }

    // Modified parsing with better error handling
    const registration_fields = (() => {
        try {
            if (!fields.registration_fields || !Array.isArray(fields.registration_fields)) {
                console.warn('registration_fields is not an array or is undefined');
                return [];
            }

            return fields.registration_fields.map((field: any, index: number) => {
                try {
                    // Try multiple access patterns
                    const nameData = field.fields?.name || field.name;
                    const typeData = field.fields?.field_type || field.field_type;

                    if (!nameData || !typeData) {
                        console.warn(`Field ${index} missing data:`, { nameData, typeData, field });
                        return null;
                    }

                    const name = bytesToString(nameData);
                    const type = bytesToString(typeData);

                    console.log(`Parsed field ${index}:`, { name, type });

                    return { name, type };
                } catch (error) {
                    console.error(`Error parsing field ${index}:`, error, field);
                    return null;
                }
            }).filter(Boolean); // Remove null entries
        } catch (error) {
            console.error('Error parsing registration_fields:', error);
            return [];
        }
    })();

    console.log('Final parsed registration_fields:', registration_fields);
    console.log('=== END DEBUGGING ===\n');
    console.log(fields)

    const event: Event = {
        id: fields.id.id,
        title: bytesToString(fields.title),
        description: bytesToString(fields.description),
        location: bytesToString(fields.location),
        start_time: timestampToDate(fields.start_time),
        end_time: timestampToDate(fields.end_time),
        date: timestampToDate(fields.start_time),
        imageUrl: bytesToString(fields.image_url),
        event_hex: fields.event_hex || (fields.tags.map((tag: number[]) => bytesToString(tag)).find((t: string) => t.startsWith('hex:'))?.replace('hex:', '') || ""),
        organizers: (fields.organizers as string[]).map((address: string) => {
            const account = accountMap.get(address);
            return {
                address: address,
                name: account?.name || `${address.slice(0, 6)}...${address.slice(-4)}`,
                avatarUrl: account?.imageUrl || getAvatarUrl(address, account?.name),
            };
        }),
        attendeesCount: Number(fields.attendees_count),
        checkedInCount: Number(fields.checked_in_count),
        createdAt: timestampToDate(fields.created_at),
        updatedAt: timestampToDate(fields.updated_at),
        registration_fields: fields.registration_fields.map((field: any) => ({
            name: bytesToString(field.fields.name),
            type: bytesToString(field.fields.field_type),
        })),
        maxAttendees: Number(fields.max_attendees),
        tags: fields.tags.map((tag: number[]) => bytesToString(tag)),
        status: bytesToString(fields.status),
        price: bytesToString(fields.price),
        allowCheckin: fields.allow_checkin,
        ticket_tiers: (fields.ticket_tiers || []).map((tier: any) => ({
            name: bytesToString(tier.fields.name),
            price: tier.fields.price.toString(),
            quantity: Number(tier.fields.capacity),
        })),
        nft_config: fields.nft_config ? {
            enabled: !!fields.nft_config.enabled,
            nft_name: bytesToString(fields.nft_config.nft_name || []),
            nft_description: bytesToString(fields.nft_config.nft_description || []),
            nft_image_url: bytesToString(fields.nft_config.nft_image_url || []),
            total_minted: Number(fields.nft_config.total_minted || 0),
        } : {
            enabled: false,
            nft_name: "",
            nft_description: "",
            nft_image_url: "",
            total_minted: 0,
        },
    };

    console.log('Final parsed single event:', event);

    return { event, isLoading: false, error: null, refetch };
};

// Get events by status
export const useGetEventsByStatus = (status: "ongoing" | "closed" | "hidden" | "past", refetchInterval?: number) => {
    const { events, isLoading, error, refetch } = useGetAllEventDetails(refetchInterval);

    const filteredEvents = events.filter(event => event.status === status);

    return { events: filteredEvents, isLoading, error, refetch };
};

// Get event by its readable hex ID
export const useGetEventByHex = (hex: string, refetchInterval?: number) => {
    const { events, isLoading, error, refetch } = useGetAllEventDetails(refetchInterval);

    const event = events.find(e => e.event_hex === hex);

    // We need to return the event with the attendees fetching logic attached
    // This is handled in the component usually, but here we can return the ID for the component to use
    // checking if we can reuse useGetEventByIdWithAttendees logic here

    return { event: event || null, isLoading, error, refetch };
};

// New Hook: Get Event ID from Hex
export const useGetEventIdFromHex = (hex: string) => {
    const { events } = useGetAllEventDetails();
    const event = events.find(e => e.event_hex === hex);
    return event?.id;
}

// Get events organized by a specific address
export const useGetEventsByOrganizer = (organizerAddress: string, refetchInterval?: number) => {
    const { events, isLoading, error, refetch } = useGetAllEventDetails(refetchInterval);

    const organizerEvents = events.filter(event =>
        event.organizers.some(org => org.address === organizerAddress)
    );

    return { events: organizerEvents, isLoading, error, refetch };
};

export const useGetEventByHexWithAttendees = (hex: string, refetchInterval?: number) => {
    // 1. Get all events to find the ID corresponding to the HEX
    const { event: basicEvent, isLoading: eventLoading, error: eventError, refetch: refetchEvent } = useGetEventByHex(hex, refetchInterval);

    // 2. Use the ID to get attendees (skip if no ID found yet)
    const {
        attendees,
        isLoading: attendeesLoading,
        error: attendeesError,
        summary,
        refetch: refetchAttendees
    } = useGetEventAttendees(basicEvent?.id || "", refetchInterval);

    // Refetch function
    const refetch = async () => {
        await Promise.all([refetchEvent(), refetchAttendees()]);
    };

    if (eventLoading || (basicEvent?.id && attendeesLoading)) {
        return {
            event: null,
            attendees: [],
            isLoading: true,
            error: null,
            summary: { total: 0, checkedIn: 0, nftMinted: 0 },
            refetch
        };
    }

    if (eventError || attendeesError) {
        return {
            event: null,
            attendees: [],
            isLoading: false,
            error: eventError || attendeesError,
            summary: { total: 0, checkedIn: 0, nftMinted: 0 },
            refetch
        };
    }

    // Merge
    const eventWithAttendees = basicEvent ? {
        ...basicEvent,
        attendees: attendees.map(a => a.address),
        attendeeDetails: attendees,
    } : null;

    return {
        event: eventWithAttendees,
        attendees,
        isLoading: false,
        error: null,
        summary,
        refetch
    };
}

export const useGetEventByIdWithAttendees = (eventId: string, refetchInterval?: number) => {
    // Get basic event data
    const { event, isLoading: eventLoading, error: eventError, refetch: refetchEvent } = useGetEventById(eventId, refetchInterval);
    console.log(event)
    // Get attendees data
    const {
        attendees,
        isLoading: attendeesLoading,
        error: attendeesError,
        summary,
        refetch: refetchAttendees
    } = useGetEventAttendees(eventId, refetchInterval);
    console.log(attendees)
    // Refetch function that triggers both event and attendees queries
    const refetch = async () => {
        await Promise.all([refetchEvent(), refetchAttendees()]);
    };

    if (eventLoading || attendeesLoading) {
        return {
            event: null,
            attendees: [],
            isLoading: true,
            error: null,
            summary: { total: 0, checkedIn: 0, nftMinted: 0 },
            refetch
        };
    }

    if (eventError || attendeesError) {
        return {
            event: null,
            attendees: [],
            isLoading: false,
            error: eventError || attendeesError,
            summary: { total: 0, checkedIn: 0, nftMinted: 0 },
            refetch
        };
    }

    // Merge event with attendees
    const eventWithAttendees = event ? {
        ...event,
        attendees: attendees.map(a => a.address),
        attendeeDetails: attendees,
    } : null;

    return {
        event: eventWithAttendees,
        attendees,
        isLoading: false,
        error: null,
        summary,
        refetch
    };
};

// Updated type for Event with attendee details
export interface EventWithAttendees extends Event {
    attendeeDetails?: AttendeeDetails[];
}