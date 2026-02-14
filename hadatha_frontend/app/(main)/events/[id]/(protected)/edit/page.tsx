"use client"

import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Save, ArrowLeft, Loader2 } from "lucide-react"
import LaunchAppBtn from "@/components/miscellneous/LaunchAppBtn"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { useParams, useRouter } from "next/navigation"
import { useUploadToWalrus } from "@/hooks/useUploadToWalrus"
import { useGetDerivedAddress, useGetDerivedAddresses } from "@/hooks/sui/useCheckAccountExistence"
import { useState, useEffect, useMemo, useRef } from "react"
import StatusModal from "@/components/miscellneous/StatusModal"
import { useGetEventByIdWithAttendees } from "@/hooks/sui/useGetAllEvents"
import { useEditEvent } from "@/hooks/sui/useEditEvent"
import { EditEventForm } from "@/components/events/EditEventForm"

const eventSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    image: z.any().optional(),
    imagePreviewUrl: z.string().optional(),
    organizer: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    eventType: z.enum(["physical", "virtual"]),
    eventLink: z.string().optional(),
    linkType: z.string().optional(),
    isAnonymous: z.boolean(),
    location: z.string().min(2, "Location is required"),
    date: z.date({ error: "Date is required" }),
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

export default function EditEventPage() {
    const params = useParams()
    const eventId = params?.id as string
    const currentAccount = useCurrentAccount()
    const router = useRouter()
    const derivedAddress = useGetDerivedAddress(currentAccount?.address)

    const { event, isLoading: isLoadingEvent, error } = useGetEventByIdWithAttendees(eventId, 1000)
    const { editEvent: editEventDetails, isEditing } = useEditEvent()
    const { uploadToWalrus, isUploading } = useUploadToWalrus()

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

    const organizerAddresses = useMemo(() => {
        return Array.isArray(event?.organizers) ? event?.organizers.map(org => (org.address)) : []
    }, [event?.organizers])
    const derivedAddreess = useGetDerivedAddresses(organizerAddresses)
    // console.log(derivedAddreess)

    // Populate form when event data is loaded - FIX: Remove methods from dependencies
    useEffect(() => {
        // Only initialize form once when event loads
        if (event && !isLoadingEvent && !isFormInitialized.current) {
            // console.log("Initializing form with event data:", event)

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
                description: event.description,
                location: event.location,
                eventType: event.is_virtual ? "virtual" : "physical",
                eventLink: event.link,
                linkType: event.link_type,
                isAnonymous: event.is_anonymous,
                date: eventDate,
                startTime,
                endTime,
                image: event.imageUrl,
                imagePreviewUrl: event.imageUrl,
                organizer: !derivedAddreess.isLoading ? derivedAddreess.derivedAddresses : [],
                tags: event.tags || [],
                ticketType: Number(event.price) === 0 ? "free" : "paid",
                maxAttendees: event.maxAttendees || 0,
                registrationFields,
            })

            // Mark form as initialized
            isFormInitialized.current = true
        }
    }, [event?.id, isLoadingEvent, derivedAddreess.isLoading, event, methods, derivedAddreess.derivedAddresses]) // Removed 'methods' from dependencies

    // Check if current user is an organizer
    const isOrganizer = useMemo(() => {
        return currentAccount && event?.organizers.some(
            (org) => org.address === currentAccount?.address
        )
    }, [currentAccount, event?.organizers])

    const onSubmit = async (data: z.infer<typeof eventSchema>) => {
        // console.log("Form Data:", data)

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

        let image_url = event?.imageUrl || ""

        // Only upload new image if one was selected
        if (data.image instanceof File) {
            try {
                const blobUrl = await uploadToWalrus(data.image)
                // console.log("New image uploaded:", blobUrl)
                image_url = blobUrl
            } catch (err) {
                console.error("Failed to upload image:", err)
                setOpenEffectModal({
                    open: true,
                    title: "Upload Failed",
                    message: "Failed to upload image to Walrus. Please try again.",
                    type: "error"
                })
                return
            }
        }

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
                id: eventId,
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

    // Loading state
    if (isLoadingEvent) {
        return (
            <div className="flex flex-col items-center justify-center gap-6 fixed w-screen h-screen top-0 left-0">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-12 backdrop-blur-xl text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Loading Event...</h1>
                    <p className="text-white/60">Please wait while we fetch the event details.</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error || !event) {
        return (
            <div className="flex flex-col items-center justify-center gap-6 fixed w-screen h-screen top-0 left-0">
                <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-12 backdrop-blur-xl text-center">
                    <h1 className="text-2xl font-bold text-red-400 mb-2">Error Loading Event</h1>
                    <p className="text-white/60 mb-6">
                        {"Event not found or could not be loaded."}
                    </p>
                    <Button
                        onClick={() => router.push("/events")}
                        className="rounded-full bg-white text-black px-8 py-6 cursor-pointer hover:bg-gray-200"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Events
                    </Button>
                </div>
            </div>
        )
    }

    // Not connected
    if (!currentAccount) {
        return (
            <div className="flex flex-col items-center justify-center gap-6 fixed w-screen h-screen top-0 left-0">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-12 backdrop-blur-xl text-center">
                    <div className="flex flex-col items-center gap-4 mb-4">
                        <h1 className="text-2xl font-bold text-white">Connect Wallet</h1>
                        <p className="text-white/60 max-w-md">
                            You need to connect your wallet to edit this event.
                        </p>
                    </div>
                    <LaunchAppBtn buttonText="Connect Wallet" redirectUrl={`/events/${eventId}/edit`} />
                </div>
            </div>
        )
    }

    // Not authorized
    if (!isOrganizer) {
        return (
            <div className="flex flex-col items-center justify-center gap-6 fixed w-screen h-screen top-0 left-0">
                <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/5 p-12 backdrop-blur-xl text-center">
                    <h1 className="text-2xl font-bold text-yellow-400 mb-2">Unauthorized</h1>
                    <p className="text-white/60 mb-6">
                        You are not authorized to edit this event. Only organizers can make changes.
                    </p>
                    <Button
                        onClick={() => router.push(`/events/${eventId}`)}
                        className="rounded-full bg-white text-black px-8 py-6 cursor-pointer hover:bg-gray-200"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        View Event
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-4 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Button
                        variant="ghost"
                        onClick={() => router.push(`/events/${eventId}`)}
                        className="mb-4 text-white/60 hover:text-white hover:bg-white/10 rounded-full px-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Event
                    </Button>
                    <h1 className="text-4xl font-bold text-white mb-2">Edit Event</h1>
                    <p className="text-white/60">Update your event details and settings.</p>
                </div>
                <Button
                    onClick={methods.handleSubmit(onSubmit)}
                    className="rounded-full bg-white text-black px-10 py-6 cursor-pointer flex items-center justify-center gap-2 font-semibold hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all duration-300"
                    disabled={isEditing || isUploading}
                >
                    {isEditing || isUploading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            {isUploading ? "Uploading..." : "Saving..."}
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>

            <FormProvider {...methods}>
                <div className="w-full">
                    <EditEventForm isLoading={isEditing || isUploading} />
                </div>
            </FormProvider>

            <StatusModal
                isOpen={openEffectModal.open}
                title={openEffectModal.title}
                description={openEffectModal.message}
                type={openEffectModal.type}
                onClose={() => {
                    if (openEffectModal.type === "success") {
                        router.push(`/events/${eventId}`)
                    }
                    setOpenEffectModal({ open: false, title: "", message: "", type: "success" })
                }}
            />
        </div>
    )
}