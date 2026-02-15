"use client"

import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Save, X, Loader2 } from "lucide-react"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { useGetDerivedAddress } from "@/hooks/sui/useCheckAccountExistence"
import { useState, useEffect, useMemo, useRef } from "react"
import StatusModal from "@/components/miscellneous/StatusModal"
import { useEditEvent } from "@/hooks/sui/useEditEvent"
import { EditEventForm } from "@/components/events/EditEventForm"
import { Event } from "@/types"

const eventSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    organizer: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    eventType: z.enum(["physical", "virtual"]),
    eventLink: z.string().optional(),
    linkType: z.string().optional(),
    isAnonymous: z.boolean(),
    location: z.string().min(2, "Location is required"),
    date: z.date({ message: "Date is required" }),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    ticketType: z.enum(["free", "paid"]),
    maxAttendees: z.number().min(1, "Must have at least 1 attendee"),
    registrationFields: z.array(
        z.object({
            label: z.string().min(1, "Label is required"),
            type: z.string(),
            options: z.string().optional(),
        })
    ).optional(),
})

interface EditEventDrawerProps {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
    event: Event
    onSuccess?: () => void
}

export function EditEventDrawer({ isOpen, setIsOpen, event, onSuccess }: EditEventDrawerProps) {
    const currentAccount = useCurrentAccount()
    const derivedAddress = useGetDerivedAddress(currentAccount?.address)

    const { editEvent: editEventDetails, isEditing } = useEditEvent()

    const [openEffectModal, setOpenEffectModal] = useState({
        open: false,
        title: "",
        message: "",
        type: "success" as "success" | "error"
    })

    // Track if form has been initialized
    const isFormInitialized = useRef(false)

    const methods = useForm<z.infer<typeof eventSchema>>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            title: "",
            description: "",
            location: "",
            eventType: "physical",
            isAnonymous: false,
            startTime: "",
            endTime: "",
            maxAttendees: 1,
            ticketType: "free",
            registrationFields: [],
            organizer: [],
            tags: [],
        },
    })

    // Get organizer account IDs (not wallet addresses)
    const organizerIds = useMemo(() => {
        if (!Array.isArray(event?.organizers)) return []
        // Filter out the first organizer (creator) and get their addresses
        return event.organizers.slice(1).map(org => org.address).filter(Boolean)
    }, [event.organizers])

    // Populate form when event data is loaded
    useEffect(() => {
        // Only initialize form once when drawer opens with event
        if (event && isOpen && !isFormInitialized.current) {
            // Convert timestamps to Date and time strings
            const eventDate = new Date(event.date)
            const startDateTime = new Date(event.start_time)
            const endDateTime = new Date(event.end_time)

            const startTime = startDateTime.toTimeString().slice(0, 5) // HH:MM format
            const endTime = endDateTime.toTimeString().slice(0, 5)

            // Map registration fields
            const registrationFields = event.registration_fields?.map((field) => ({
                label: field.name,
                type: field.type,
                options: ""
            })) || []

            // Reset form with event data
            methods.reset({
                title: event.title,
                description: event.description || "",
                location: event.location,
                eventType: event.is_virtual ? "virtual" : "physical",
                eventLink: event.link,
                linkType: event.link_type,
                isAnonymous: event.is_anonymous,
                date: eventDate,
                startTime,
                endTime,
                organizer: organizerIds,
                tags: event.tags || [],
                ticketType: Number(event.price) === 0 ? "free" : "paid",
                maxAttendees: event.maxAttendees || 0,
                registrationFields,
            })

            // Mark form as initialized
            isFormInitialized.current = true
        }

        // Reset initialization flag when drawer closes
        if (!isOpen) {
            isFormInitialized.current = false
        }
    }, [event, isOpen, organizerIds, methods])

    // Check if current user is an organizer
    const isOrganizer = useMemo(() => {
        return currentAccount && event?.organizers.some(
            (org) => org.address === currentAccount?.address
        )
    }, [currentAccount, event.organizers])

    const onSubmit = async (data: z.infer<typeof eventSchema>) => {
        if (!derivedAddress) {
            setOpenEffectModal({
                open: true,
                title: "Error",
                message: "Account not found. Please connect your wallet.",
                type: "error"
            })
            return
        }

        if (!isOrganizer) {
            setOpenEffectModal({
                open: true,
                title: "Unauthorized",
                message: "You are not authorized to edit this event.",
                type: "error"
            })
            return
        }

        // Keep the existing image URL (image upload removed from drawer)
        const image_url = event?.imageUrl || ""

        try {
            // Combine date and time to get milliseconds
            const startDateTime = new Date(data.date)
            const [startHour, startMinute] = data.startTime.split(':')
            startDateTime.setHours(parseInt(startHour), parseInt(startMinute))

            const endDateTime = new Date(data.date)
            const [endHour, endMinute] = data.endTime.split(':')
            endDateTime.setHours(parseInt(endHour), parseInt(endMinute))

            // Extract registration field names and types
            const registrationFieldNames = data.registrationFields?.map(field => field.label) || []
            const registrationFieldTypes = data.registrationFields?.map(field => field.type) || []

            await editEventDetails({
                id: event.id,
                title: data.title,
                description: data.description,
                location: data.location,
                isVirtual: data.eventType === "virtual",
                link: data.eventLink || "",
                linkType: data.linkType || "",
                isAnonymous: data.isAnonymous || false,
                startTime: startDateTime.getTime(),
                endTime: endDateTime.getTime(),
                imageUrl: image_url,
                event_hex: event?.event_hex || "",
                registrationFieldNames,
                registrationFieldTypes,
                maxAttendees: data.maxAttendees,
                organizers: data.organizer || [],
                tags: data.tags || [],
                tierNames: [], // TODO: Support editing tiers if needed
                tierPrices: [],
                tierCurrencies: [],
                tierCapacities: [],
            })

            setOpenEffectModal({
                open: true,
                title: "Success",
                message: "Event updated successfully!",
                type: "success"
            })
        } catch (error) {
            console.error("Failed to update event:", error)
            setOpenEffectModal({
                open: true,
                title: "Error",
                message: "Failed to update event. See console for details.",
                type: "error"
            })
        }
    }

    const closeDrawer = () => {
        setIsOpen(false)
    }

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={closeDrawer}
                />
            )}

            {/* Side Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full md:w-[600px] lg:w-[700px] bg-[#1A1A1A] border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="sticky top-0 bg-[#1A1A1A] border-b border-white/10 px-6 py-4 z-10 flex items-center justify-between">
                        <h2 className="text-xl sm:text-2xl font-bold text-white">Edit Event</h2>
                        <button
                            onClick={closeDrawer}
                            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                            aria-label="Close drawer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <FormProvider {...methods}>
                            <EditEventForm isLoading={isEditing} />
                        </FormProvider>
                    </div>

                    {/* Footer with Action Buttons */}
                    <div className="sticky bottom-0 bg-[#1A1A1A] border-t border-white/10 px-6 py-4 z-10">
                        <div className="flex flex-col-reverse sm:flex-row gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={closeDrawer}
                                className="flex-1 text-white border border-white/10 hover:bg-white/5 h-11 text-sm font-medium"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={methods.handleSubmit(onSubmit)}
                                disabled={isEditing}
                                className="flex-1 bg-white text-black hover:bg-white/90 font-semibold h-11 text-sm"
                            >
                                {isEditing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <StatusModal
                isOpen={openEffectModal.open}
                title={openEffectModal.title}
                description={openEffectModal.message}
                type={openEffectModal.type}
                onClose={() => {
                    if (openEffectModal.type === "success") {
                        setIsOpen(false)
                        onSuccess?.()
                    }
                    setOpenEffectModal({ open: false, title: "", message: "", type: "success" })
                }}
            />
        </>
    )
}
