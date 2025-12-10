"use client"

import { useFormContext } from "react-hook-form"
import EventDetails from "@/components/miscellneous/EventDetails"
import { Event } from "@/types"
import { format } from "date-fns"

export function EventPreview() {
    const { watch } = useFormContext()
    const values = watch()

    // Map form values to Event interface
    const eventPreviewData: Event = {
        id: "preview",
        title: values.title || "Event Title",
        description: values.description || "Event description will appear here...",
        location: values.location || "Location",
        date: values.date ? format(values.date, "PPP") : "Date",
        imageUrl: values.image || "",
        organizers: (values.organizer || []).map((org: string) => ({
            name: org === "abdul" ? "Abdul" : org, // Simple mapping for demo
            avatarUrl: "https://github.com/shadcn.png" // Placeholder
        })),
        attendees: [],
        attendeesCount: 0,
        registration_fields: values.registrationFields?.map((f: { label: string, type: string }) => ({
            name: f.label,
            type: f.type
        })) || [],
        maxAttendees: values.maxAttendees,
        start_time: values.startTime,
        end_time: values.endTime,
        tags: values.tags
    }

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <EventDetails event={eventPreviewData} preview={true} />
        </div>
    )
}
