"use client"

import { useFormContext } from "react-hook-form"
import EventDetails from "@/components/miscellneous/EventDetails"
import { Event } from "@/types"
import { format } from "date-fns"
import { useGetOrganizersByAddresses } from "@/hooks/sui/useGetOrganizersByAddresses"
import { useMemo } from "react"

export function EventPreview() {
    const { watch } = useFormContext()
    const values = watch()

    const imageUrl = values.imagePreviewUrl ?? (typeof values.image === "string" ? values.image : "")

    // Get organizer addresses from form - ensure it's always an array
    const organizerAddresses = useMemo(() => {
        return Array.isArray(values.organizer) ? values.organizer : []
    }, [values.organizer])

    // Fetch organizer details
    const { organizers, isLoading: isLoadingOrganizers } = useGetOrganizersByAddresses(organizerAddresses)

    // Map form values to Event interface
    const eventPreviewData: Event = {
        id: "preview",
        title: values.title || "Event Title",
        description: values.description || "Event description will appear here...",
        location: values.location || "Location",
        date: values.date ? format(values.date, "PPP") : "Date",
        imageUrl: imageUrl,
        organizers: isLoadingOrganizers
            ? organizerAddresses.map((addr: string) => ({
                name: "Loading...",
                avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + addr,
                address: addr,
            }))
            : organizers,
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
