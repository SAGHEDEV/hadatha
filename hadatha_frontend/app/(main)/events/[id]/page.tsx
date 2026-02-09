"use client";

import EventDetails from "@/components/miscellneous/EventDetails";
import {
    useGetEventByIdWithAttendees,
    useGetEventByHex,
    useGetEventByHexWithAttendees,
} from "@/hooks/sui/useGetAllEvents";
import { useParams } from "next/navigation";
import LoadingState from "@/components/miscellneous/LoadingState";

const EventDetailsPage = () => {
    const params = useParams();
    const id = params.id as string;

    // Check if the id is an object ID (starts with 0x)
    const isObjectId = id.startsWith('0x');

    const {
        event: objectEvent,
        isLoading: objectLoading,
        error: objectError,
        refetch: refetchObject
    } = useGetEventByIdWithAttendees(isObjectId ? id : "", 1000);

    const {
        event: hexEvent,
        isLoading: hexLoading,
        error: hexError,
        refetch: refetchHex
    } = useGetEventByHexWithAttendees(!isObjectId ? id : "", 1000);

    const isLoading = isObjectId ? objectLoading : hexLoading;
    const error = isObjectId ? objectError : hexError;
    const event = isObjectId ? objectEvent : hexEvent;

    if (isLoading) {
        return (
            <LoadingState loadingText="Loading Event Details..." />
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <h2 className="text-2xl font-bold text-red-500">Error loading event</h2>
                <p className="text-white/60">{error.message}</p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <h2 className="text-2xl font-bold text-white">Event not found</h2>
                <p className="text-white/60">We couldn&apos;t find an event with the ID or hex &quot;{id}&quot;</p>
            </div>
        );
    }

    const refetchAll = async () => {
        if (isObjectId) {
            await refetchObject();
        } else {
            await refetchHex();
        }
    }

    return (
        <EventDetails event={event} onRegisterSuccess={refetchAll} />
    );
};

export default EventDetailsPage;