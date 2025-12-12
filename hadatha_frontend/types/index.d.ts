import { AttendeeDetails } from "@/hooks/sui/useGetEventAttendees";

export interface Event {
    id: string;
    title: string;
    description: string;
    location: string;
    date: string;
    start_time: string;
    end_time: string;
    imageUrl: string;
    organizers: {
        name: string;
        avatarUrl: string;
        address: string;
    }[];
    attendees?: string[];
    attendeeDetails?: AttendeeDetails[];
    attendeesCount?: number;
    createdAt?: string;
    updatedAt?: string;
    registration_fields?: {
        name: string;
        type: string;
    }[];
    maxAttendees?: number;
    tags?: string[];
    status?: string;
    price?: string;
    allowCheckin?: boolean;
    checkedInCount?: number;
}

export type RegistrationStatus = "registered" | "checked-in" | "cancelled";

export interface Registration {
    id: string;
    eventId: string;
    user: {
        name: string;
        email: string;
        avatarUrl?: string;
    };
    registrationDate: string;
    status: RegistrationStatus;
    ticketType: string;
    checkInTime?: string;
    address?: string; // Wallet address
    registrationData?: Record<string, string>; // Custom registration fields
    nftMinted?: boolean; // Whether NFT has been minted
}

// Account Types
export interface AccountDetails {
    id: string;
    address: string;
    name: string;
    email: string;
    image_url: string;
    total_attended: number;
    total_organized: number;
    total_hosted: number;
    total_registered: number;
}

// NFT Types
export interface NFTConfig {
    enabled: boolean;
    nft_name: string;
    nft_description: string;
    nft_image_url: string;
    total_minted: number;
}

export interface AttendanceNFT {
    id: string;
    event_id: string;
    event_title: string;
    attendee_name: string;
    attendee_address: string;
    check_in_time: number;
    mint_time: number;
    image_url: string;
    description: string;
}