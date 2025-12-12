"use client"

import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateEventForm } from "@/components/events/create/CreateEventForm"
import { EventPreview } from "@/components/events/create/EventPreview"
import { Button } from "@/components/ui/button"
import { Eye, Edit3, Save } from "lucide-react"
import LaunchAppBtn from "@/components/miscellneous/LaunchAppBtn"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { usePathname, useRouter } from "next/navigation"
import { useCreateEvent } from "@/hooks/sui/useCreateEvent"
import { useUploadToWalrus } from "@/hooks/useUploadToWalrus"
import { useGetDerivedAddress } from "@/hooks/sui/useCheckAccountExistence"
import { useState } from "react"
import StatusModal from "@/components/miscellneous/StatusModal"

const eventSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    image: z.any().optional(),
    imagePreviewUrl: z.string().optional(),
    organizer: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
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
        },
    })
    const { uploadToWalrus, isUploading } = useUploadToWalrus();
    const { createEvent, isCreating } = useCreateEvent()
    const derivedAddress = useGetDerivedAddress(currentAccount?.address);
    const [openEffectModal, setOpenEffectModal] = useState({ open: false, title: "", message: "", type: "success" as "success" | "error" })
    const router = useRouter()



    const onSubmit = async (data: z.infer<typeof eventSchema>) => {
        console.log("Form Data:", data)

        if (!derivedAddress) {
            alert("Account not found. Please connect your wallet.");
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

            await createEvent({
                account: derivedAddress,
                title: data.title,
                description: data.description,
                location: data.location,
                startTime: startDateTime.getTime(),
                endTime: endDateTime.getTime(),
                imageUrl: image_url,
                registrationFieldNames,
                registrationFieldTypes,
                maxAttendees: data.maxAttendees,
                tags: data.tags || [],
                price: data.ticketType === "free" ? "0" : "0", // Default to 0 for now as paid is disabled
            });

            setOpenEffectModal({ open: true, title: "Event Created Successfully!", message: "Event Created Successfully!", type: "success" })
            methods.reset();
        } catch (error) {
            console.error("Failed to create event:", error);
            setOpenEffectModal({ open: true, title: "Failed to create event", message: "Failed to create event. See console for details.", type: "error" })
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
                    <div className="flex justify-center">
                        <TabsList className="bg-white/5 border border-white/10 px-4 py-6 min-h-[72px] rounded-full flex gap-2">
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