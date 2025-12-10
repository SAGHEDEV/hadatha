"use client"

import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateEventForm } from "@/components/events/create/CreateEventForm"
import { EventPreview } from "@/components/events/create/EventPreview"
import { Button } from "@/components/ui/button"
import { Eye, Edit3, Save } from "lucide-react"

const eventSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    image: z.string().optional(),
    organizer: z.array(z.string()).min(1, "Please select at least one organizer"),
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
    const methods = useForm<z.infer<typeof eventSchema>>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            ticketType: "free",
            registrationFields: [],
            organizer: [],
            tags: [],
        },
    })

    const onSubmit = (data: z.infer<typeof eventSchema>) => {
        console.log("Form Data:", data)
        // Here we would typically send data to backend
        alert("Event Created! Check console for data.")
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
                >
                    <Save className="w-6 h-6 mr-2" />
                    Publish Event
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
                        <CreateEventForm />
                    </TabsContent>

                    <TabsContent value="preview" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <EventPreview />
                    </TabsContent>
                </Tabs>
            </FormProvider>
        </div>
    )
}