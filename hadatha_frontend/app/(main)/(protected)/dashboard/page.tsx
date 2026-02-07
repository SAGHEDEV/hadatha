"use client"

import StatsCard from "@/components/miscellneous/StatsCard"
import EventCard from "@/components/miscellneous/EventCard"
import { Calendar, Users, Ticket, AlertCircle, Compass } from "lucide-react"
import { useCheckAccountExistence } from "@/hooks/sui/useCheckAccountExistence"
import { useGetAllEventDetails } from "@/hooks/sui/useGetAllEvents"
import LoadingState from "@/components/miscellneous/LoadingState"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { useMemo } from "react"
import Link from "next/link"

const Dashboard = () => {

    const { account, isLoading } = useCheckAccountExistence()
    const currentAccount = useCurrentAccount()
    const { events, isLoading: isEventsLoading, error: eventsError } = useGetAllEventDetails()

    // Filter events to show only registered events
    const registeredEvents = useMemo(() => {
        if (!events || !currentAccount?.address) return { upcoming: [], past: [] }

        const now = new Date().getTime()
        const registered = events.filter(event => {
            // Check if user is registered for this event
            // This is a placeholder - you'll need to implement the actual registration check
            // based on your smart contract structure
            return event.attendees?.some(attendee =>
                attendee.toLowerCase() === currentAccount.address.toLowerCase()
            )
        })

        const upcoming = registered.filter(event => new Date(event.date).getTime() >= now).slice(0, 3)
        const past = registered.filter(event => new Date(event.date).getTime() < now).slice(0, 3)

        return { upcoming, past }
    }, [events, currentAccount])

    // Mock Data
    const stats = [
        {
            title: "Events Attended",
            value: account?.total_attended || "0",
            icon: Ticket,
            description: "Total events you participated in",
            trend: "+2 this month"
        },
        {
            title: "Events Hosted",
            value: account?.total_organized || "0",
            icon: Calendar,
            description: "Events you organized",
            trend: "+1 this month"
        },
        {
            title: "People Hosted",
            value: account?.total_hosted || "0",
            icon: Users,
            description: "Total attendees across your events",
            trend: "+15% vs last month"
        },
        {
            title: "Missed Events",
            value: "0",
            icon: AlertCircle,
            description: "Registered but didn't attend",
            trend: "-1 this month"
        }
    ]

    if (isLoading) {
        return <LoadingState loadingText="Loading account stats..." />
    }

    return (
        <div className="flex flex-col gap-12">
            {/* Welcome Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold text-white">Dashboard</h1>
                <p className="text-white/60">Welcome back! Here&apos;s an overview of your registered events.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            {/* Registered Events Section */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Your Registered Events</h2>
                </div>

                {isEventsLoading ? (
                    <div className="flex items-center justify-center min-h-[200px] col-span-full">
                        <LoadingState loadingText="Loading Events..." />
                    </div>
                ) : eventsError ? (
                    <div className="flex items-center justify-center min-h-[200px] col-span-full text-red-400">
                        <p>Error loading events: {eventsError.message}</p>
                    </div>
                ) : registeredEvents.upcoming.length > 0 || registeredEvents.past.length > 0 ? (
                    <>
                        {/* Upcoming Registered Events */}
                        {registeredEvents.upcoming.length > 0 && (
                            <div className="flex flex-col gap-4">
                                <h3 className="text-lg font-semibold text-white/80">Upcoming</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {registeredEvents.upcoming.map((event) => (
                                        <EventCard key={event.id} {...event} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Past Registered Events */}
                        {registeredEvents.past.length > 0 && (
                            <div className="flex flex-col gap-4">
                                <h3 className="text-lg font-semibold text-white/80">Past Events</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {registeredEvents.past.map((event) => (
                                        <EventCard key={event.id} {...event} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 gap-6 col-span-full">
                        <div className="p-6 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                            <Compass className="w-12 h-12 text-white/40" />
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-xl font-semibold text-white/60">No registered events yet</p>
                            <p className="text-sm text-white/40">Discover amazing events happening around you</p>
                        </div>
                        <Link
                            href="/events"
                            className="group relative px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-medium hover:bg-white/20 hover:border-white/30 transition-all duration-300 cursor-pointer flex items-center gap-2"
                        >
                            <Compass className="w-5 h-5" />
                            Explore Events
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard