"use client"

import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { SUI_TYPE, USDC_TYPE } from "@/lib/constant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateEventForm } from "@/components/events/create/CreateEventForm"
import { EventPreview } from "@/components/events/create/EventPreview"
import { Button } from "@/components/ui/button"
import { Eye, Edit3, Save, Loader2, Users } from "lucide-react"
import LaunchAppBtn from "@/components/miscellneous/LaunchAppBtn"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { usePathname, useRouter } from "next/navigation"
import { useCreateEvent } from "@/hooks/sui/useCreateEvent"
import { useUploadToWalrus } from "@/hooks/useUploadToWalrus"
import { useCheckAccountExistence, useGetDerivedAddress } from "@/hooks/sui/useCheckAccountExistence"
import { useState } from "react"
import StatusModal from "@/components/miscellneous/StatusModal"
import { generateEventHex } from "@/lib/utils"

const eventSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    image: z.any().optional(),
    imagePreviewUrl: z.string().optional(),
    organizer: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    location: z.string().min(2, "Location is required"),
    location_lat: z.number().optional(),
    location_lng: z.number().optional(),
    date: z.date({ error: "Date is required" }),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    ticketType: z.enum(["free", "paid"]),
    ticketTiers: z.array(z.object({
        name: z.string().min(1, "Tier name is required"),
        price: z.string().min(1, "Price is required"),
        currency: z.enum(["SUI", "USDC"]),
        quantity: z.number().min(1, "Quantity must be at least 1")
    })).optional(),
    maxAttendees: z.number().min(1, "Must have at least 1 attendee"),
    registrationFields: z.array(
        z.object({
            label: z.string().min(1, "Label is required"),
            type: z.string(),
            options: z.string().optional(),
        })
    ).optional(),
})

export default function CreateEventPage() {
    const currentAccount = useCurrentAccount()
    const pathname = usePathname()
    const methods = useForm<z.infer<typeof eventSchema>>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            ticketType: "free",
            registrationFields: [],
            organizer: [],
            tags: [],
            ticketTiers: []
        },
    })
    const { uploadToWalrus, isUploading } = useUploadToWalrus();
    const { createEvent, isCreating } = useCreateEvent()
    const derivedAddress = useGetDerivedAddress(currentAccount?.address);
    const [openEffectModal, setOpenEffectModal] = useState({ open: false, title: "", message: "", type: "success" as "success" | "error" })
    const router = useRouter()



    const { hasAccount, isLoading: isAccountLoading } = useCheckAccountExistence()

    const onSubmit = async (data: z.infer<typeof eventSchema>) => {
        console.log("Form Data:", data)

        if (!hasAccount) {
            setOpenEffectModal({
                open: true,
                title: "Account Required",
                message: "You need to create a Hadatha profile to host events. Please join Hadatha first.",
                type: "error"
            })
            return;
        }

        let image_url = ""
        if (data.image instanceof File) {
            try {
                const blobUrl = await uploadToWalrus(data.image)
                console.log(blobUrl)
                image_url = blobUrl
            } catch (err) {
                throw new Error("Failed to upload image to Walrus", { cause: err })
            }
        }

        try {
            // Combine date and time to get milliseconds
            const startDateTime = new Date(data.date);
            const [startHour, startMinute] = data.startTime.split(':');
            startDateTime.setHours(parseInt(startHour), parseInt(startMinute));

            const endDateTime = new Date(data.date);
            const [endHour, endMinute] = data.endTime.split(':');
            endDateTime.setHours(parseInt(endHour), parseInt(endMinute));

            // Extract registration field names and types
            const registrationFieldNames = data.registrationFields?.map(field => field.label) || [];
            const registrationFieldTypes = data.registrationFields?.map(field => field.type) || [];

            console.log(registrationFieldNames)
            console.log(registrationFieldTypes)

            // Generate event_hex
            const event_hex = generateEventHex();

            // Prepare Tags (include lat/lng and hex)
            const submissionTags = [...(data.tags || [])];
            if (data.location_lat && data.location_lng) {
                submissionTags.push(`lat:${data.location_lat}`);
                submissionTags.push(`lng:${data.location_lng}`);
            }

            let tierNames: string[] = [];
            let tierPrices: string[] = [];
            let tierCurrencies: string[] = [];
            let tierCapacities: number[] = [];

            if (data.ticketType === "paid" && data.ticketTiers && data.ticketTiers.length > 0) {
                // For each tier, map its currency to the correct Sui type
                tierCurrencies = data.ticketTiers.map(t => t.currency === "USDC" ? USDC_TYPE : SUI_TYPE);
                tierPrices = data.ticketTiers.map(t => (parseFloat(t.price) * 1_000_000_000).toString());
                tierNames = data.ticketTiers.map(t => t.name);
                tierCapacities = data.ticketTiers.map(t => t.quantity);
            } else {
                // Default tier for free events
                tierNames = ["General Admission"];
                tierPrices = ["0"];
                tierCurrencies = [SUI_TYPE];
                tierCapacities = [data.maxAttendees];
            }

            if (!derivedAddress) {
                setOpenEffectModal({
                    open: true,
                    title: "Account Error",
                    message: "Unable to retrieve your account address. Please try again.",
                    type: "error"
                })
                return;
            }

            await createEvent({
                account: derivedAddress,
                title: data.title,
                description: data.description,
                location: data.location,
                startTime: startDateTime.getTime(),
                endTime: endDateTime.getTime(),
                imageUrl: image_url,
                event_hex,
                registrationFieldNames,
                registrationFieldTypes,
                organizers: data.organizer || [],
                maxAttendees: data.maxAttendees,
                tags: submissionTags,
                tierNames,
                tierPrices,
                tierCurrencies,
                tierCapacities,
            });

            setOpenEffectModal({ open: true, title: "Event Created Successfully!", message: "Event Created Successfully!", type: "success" })
            methods.reset();
        } catch (error) {
            console.error("Failed to create event:", error);
            setOpenEffectModal({ open: true, title: "Failed to create event", message: "Failed to create event. Please try again.", type: "error" })
        }
    }

    if (!currentAccount) {
        return (
            <div className="flex flex-col items-center justify-center gap-6 fixed w-screen h-screen top-0 left-0">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-12 backdrop-blur-xl text-center">
                    <div className="flex flex-col items-center gap-4 mb-4">
                        <h1 className="text-2xl font-bold text-white">Connect Wallet</h1>
                        <p className="text-white/60 max-w-md">
                            You need to connect your wallet to access this page.
                        </p>
                    </div>
                    <LaunchAppBtn buttonText="Connect Wallet" redirectUrl={pathname} />
                </div>
            </div>
        )
    }

    if (isAccountLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <p className="text-white/60">Verifying your account...</p>
            </div>
        )
    }

    if (!hasAccount) {
        return (
            <div className="flex flex-col items-center justify-center gap-6 fixed w-screen h-screen top-0 left-0 px-6">
                <div className="rounded-4xl border border-white/10 bg-white/5 p-8 md:p-12 backdrop-blur-3xl text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-white/5 rounded-full blur-3xl" />

                    <div className="flex flex-col items-center gap-6 relative z-10">
                        <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center border border-white/20 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                            <Users className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white mb-3">Join Hadatha</h1>
                            <p className="text-white/50 max-w-sm mx-auto leading-relaxed">
                                To create and manage events, you first need to initialize your on-chain identity. This is a one-time process.
                            </p>
                        </div>
                        <Button
                            onClick={() => router.push("/profile")}
                            className="bg-white text-black hover:bg-white/90 rounded-full px-12 py-7 h-auto text-lg font-bold shadow-xl active:scale-95 transition-all cursor-pointer"
                        >
                            Create Profile
                        </Button>
                        <button
                            onClick={() => router.push("/events")}
                            className="text-white/40 hover:text-white transition-colors text-sm font-medium"
                        >
                            Back to Events
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-4 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Create Event</h1>
                    <p className="text-white/60">Design and publish your event page.</p>
                </div>
                <Button
                    onClick={methods.handleSubmit(onSubmit)}
                    className="rounded-full bg-white text-black px-10! py-6! cursor-pointer flex items-center justify-center gap-2 font-semibold hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all duration-300"
                    disabled={isCreating || isUploading}
                >
                    <Save className="w-6 h-6 mr-2" />
                    {isCreating || isUploading ? "Creating..." : "Publish Event"}
                </Button>
            </div>

            <FormProvider {...methods}>
                <Tabs defaultValue="create" className="w-full space-y-8">
                    <div className="w-full flex justify-center">
                        <TabsList className="w-full bg-white/5 border border-white/10 px-4 py-6 min-h-[72px] rounded-full flex gap-2">
                            <TabsTrigger
                                value="create"
                                className="rounded-full px-6 py-6 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-black hover:bg-white/20 data-[state=active]:hover:bg-gray-200 data-[state=active]:hover:text-black hover:textblack data-[state=active]:font-semibold text-white/60 transition-all"
                            >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Create & Edit
                            </TabsTrigger>
                            <TabsTrigger
                                value="preview"
                                className="rounded-full px-6 py-6 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-black hover:bg-white/20 data-[state=active]:hover:bg-gray-200 data-[state=active]:hover:text-black hover:textblack data-[state=active]:font-semibold text-white/60 transition-all"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="create" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CreateEventForm isLoading={isCreating || isUploading} />
                    </TabsContent>

                    <TabsContent value="preview" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <EventPreview />
                    </TabsContent>
                </Tabs>
            </FormProvider>
            <StatusModal isOpen={openEffectModal.open} title={openEffectModal.title} description={openEffectModal.message} type={openEffectModal.type} onClose={() => { router.push("/events"); setOpenEffectModal({ open: false, title: "", message: "", type: "success" }) }} />
        </div>
    )
}