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
    }[];
    attendees?: string[];
    attendeesCount?: number;
    createdAt?: string;
    updatedAt?: string;
    registration_fields?: {
        name: string;
        type: string;
    }[];
    maxAttendees?: number;
    tags?: string[];
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
    ticketType?: string; // e.g., "General Admission", "VIP"
    checkInTime?: string;
    answers?: Record<string, string | number>; // For dynamic fields
}