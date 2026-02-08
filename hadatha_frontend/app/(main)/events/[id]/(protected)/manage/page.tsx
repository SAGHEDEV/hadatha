"use client"

import { useGetEventById } from "@/hooks/sui/useGetAllEvents"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, LayoutDashboard, Users, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewTab } from "@/components/events/manage/OverviewTab"
import { RegistrationsTab } from "@/components/events/manage/RegistrationsTab"
import { GuestsTab } from "@/components/events/manage/GuestsTab"

export default function ManageEventPage() {
    const params = useParams()
    const router = useRouter()
    const eventId = params?.id as string
    const { event, isLoading, error } = useGetEventById(eventId)

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 pb-10 px-4 md:px-8 max-w-7xl mx-auto flex items-center justify-center">
                <p className="text-white/60">Loading event details...</p>
            </div>
        )
    }

    if (error || !event) {
        return (
            <div className="min-h-screen pt-24 pb-10 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center gap-4">
                <p className="text-red-400">Failed to load event</p>
                <Button onClick={() => router.push("/events")} variant="outline">
                    Back to Events
                </Button>
            </div>
        )
    }

    const hasEventEnded = new Date(event.end_time) <= new Date()

    return (
        <div className="min-h-screen pt-4 pb-10 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-6">
                <Button
                    variant="ghost"
                    className="w-fit pl-0 text-white/60 hover:text-white"
                    onClick={() => router.push(`/events/${eventId}`)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Event Page
                </Button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Manage Event</h1>
                        <p className="text-white/60 text-lg">{event.title}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full space-y-8">
                <div className="flex justify-start overflow-x-auto pb-2 md:pb-0">
                    <TabsList className="bg-white/5 border border-white/10 p-1 min-h-[60px] rounded-full flex gap-1 w-full md:w-auto">
                        <TabsTrigger
                            value="overview"
                            className="rounded-full px-8 py-3 data-[state=active]:bg-white data-[state=active]:text-black text-white/60 hover:text-white transition-all text-base"
                        >
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="registrations"
                            className="rounded-full px-8 py-3 data-[state=active]:bg-white data-[state=active]:text-black text-white/60 hover:text-white transition-all text-base"
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Registrations
                        </TabsTrigger>
                        <TabsTrigger
                            value="guests"
                            className="rounded-full px-8 py-3 data-[state=active]:bg-white data-[state=active]:text-black text-white/60 hover:text-white transition-all text-base"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Guests
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <OverviewTab event={event} hasEventEnded={hasEventEnded} />
                </TabsContent>

                <TabsContent value="registrations" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <RegistrationsTab />
                </TabsContent>

                <TabsContent value="guests" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <GuestsTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}
