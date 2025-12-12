"use client"

import StatsCard from "@/components/miscellneous/StatsCard"
import EventCard from "@/components/miscellneous/EventCard"
import { Calendar, Users, Ticket, AlertCircle } from "lucide-react"
import { useCheckAccountExistence } from "@/hooks/sui/useCheckAccountExistence"
import { useGetAllEventDetails } from "@/hooks/sui/useGetAllEvents"
import LoadingState from "@/components/miscellneous/LoadingState"

const Dashboard = () => {

    const { account, isLoading } = useCheckAccountExistence()
    const { events, isLoading: isEventsLoading, error: eventsError } = useGetAllEventDetails()
    const upcomingEventsList = events ? events.slice(0, 3) : []
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
            value: Number(account?.total_registered) - Number(account?.total_attended) || "0",
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
                <p className="text-white/60">Welcome back! Heres an overview of your activity.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            {/* Upcoming Events Section */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>
                    <button className="text-sm text-white/60 hover:text-white transition-colors">View All</button>
                </div>

                {isEventsLoading ? (
                    <div className="flex items-center justify-center min-h-[200px] col-span-full">
                        <LoadingState loadingText="Loading Events..." />
                    </div>
                ) : eventsError ? (
                    <div className="flex items-center justify-center min-h-[200px] col-span-full text-red-400">
                        <p>Error loading events: {eventsError.message}</p>
                    </div>
                ) : upcomingEventsList.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingEventsList.map((event) => (
                            <EventCard key={event.id} {...event} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-white/40 col-span-full">
                        <p className="text-lg">No upcoming events</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard