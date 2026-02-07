export enum NotificationType {
    SUCCESS = "success",
    ERROR = "error",
    INFO = "info",
    WARNING = "warning",
}

export interface Notification {
    id: string;
    title: string;
    description: string;
    type: NotificationType;
    timestamp: number;
    unread: boolean;
    eventType: string;
    eventId?: string;
    relatedAddress?: string;
}

// Contract Event Types
export interface EventCreatedEvent {
    event_id: string;
    creator: string;
    title: string;
    event_hex: string;
    timestamp: string;
}

export interface EventRegisteredEvent {
    event_id: string;
    attendee: string;
    timestamp: string;
}

export interface EventCheckedInEvent {
    event_id: string;
    attendee: string;
    checked_in_by: string;
    timestamp: string;
}

export interface EventUpdatedEvent {
    event_id: string;
    event_hex: string;
    updated_by: string;
    timestamp: string;
}

export interface AccountCreatedEvent {
    account_id: string;
    owner: string;
    name: string;
}

export interface AttendanceNFTMintedEvent {
    nft_id: string;
    event_id: string;
    attendee: string;
    timestamp: string;
}

export interface NFTCollectionEnabledEvent {
    event_id: string;
    enabled_by: string;
    timestamp: string;
}

export type ContractEvent =
    | EventCreatedEvent
    | EventRegisteredEvent
    | EventCheckedInEvent
    | EventUpdatedEvent
    | AccountCreatedEvent
    | AttendanceNFTMintedEvent
    | NFTCollectionEnabledEvent;
