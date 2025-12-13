"use client";

import EventDetails from "@/components/miscellneous/EventDetails";
import { useGetEventByIdWithAttendees } from "@/hooks/sui/useGetAllEvents";
import { useParams } from "next/navigation";
import LoadingState from "@/components/miscellneous/LoadingState";

const EventDetailsPage = () => {
    const params = useParams();
    const id = params.id as string;

    const { event, isLoading, error } = useGetEventByIdWithAttendees(id, 1000);
    console.log(event?.attendees)

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
            </div>
        );
    }

    return (
        <EventDetails event={event} />
    );
};

export default EventDetailsPage;