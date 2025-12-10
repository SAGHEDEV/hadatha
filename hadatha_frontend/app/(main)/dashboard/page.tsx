"use client"

import StatsCard from "@/components/miscellneous/StatsCard"
import EventCard from "@/components/miscellneous/EventCard"
import { Calendar, Users, Ticket, AlertCircle } from "lucide-react"

const Dashboard = () => {
    // Mock Data
    const stats = [
        {
            title: "Events Attended",
            value: "12",
            icon: Ticket,
            description: "Total events you participated in",
            trend: "+2 this month"
        },
        {
            title: "Events Hosted",
            value: "5",
            icon: Calendar,
            description: "Events you organized",
            trend: "+1 this month"
        },
        {
            title: "People Hosted",
            value: "1,234",
            icon: Users,
            description: "Total attendees across your events",
            trend: "+15% vs last month"
        },
        {
            title: "Missed Events",
            value: "3",
            icon: AlertCircle,
            description: "Registered but didn't attend",
            trend: "-1 this month"
        }
    ]

    const upcomingEvents = [
        {
            id: 1,
            title: "Sui Builder House: Lagos",
            date: "Dec 15, 2025 • 10:00 AM",
            location: "Eko Hotel & Suites, Lagos",
            imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
            attendeesCount: 450,
            organizer: {
                name: "Sui Foundation",
                avatarUrl: "https://cryptologos.cc/logos/sui-sui-logo.png"
            }
        },
        {
            id: 2,
            title: "Web3 Design Summit",
            date: "Jan 20, 2026 • 09:00 AM",
            location: "Virtual Event",
            imageUrl: "https://images.unsplash.com/photo-1558403194-611308249627?q=80&w=2070&auto=format&fit=crop",
            attendeesCount: 1200,
            organizer: {
                name: "Design DAO",
                avatarUrl: "https://ui-avatars.com/api/?name=Design+DAO&background=random"
            }
        },
        {
            id: 3,
            title: "NFT Art Exhibition",
            date: "Feb 05, 2026 • 06:00 PM",
            location: "Art X Gallery, Lagos",
            imageUrl: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?q=80&w=2018&auto=format&fit=crop",
            attendeesCount: 85,
            organizer: {
                name: "Art Collective",
                avatarUrl: "https://ui-avatars.com/api/?name=Art+Collective&background=random"
            }
        }
    ]

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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingEvents.map((event) => (
                        <EventCard key={event.id} {...event} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Dashboard