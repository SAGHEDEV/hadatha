"use client"

import { useState } from "react"
import EventCard from "@/components/miscellneous/EventCard"
import { Search, MapPin } from "lucide-react"

const EventsPage = () => {
    const [activeCategory, setActiveCategory] = useState("All")
    const [activeLocation, setActiveLocation] = useState("All")

    const categories = ["All", "Tech", "Art", "Music", "Business", "Social"]
    const locations = ["All", "Online", "In-Person", "Nearest to me"]

    // Mock Data (Extended)
    const allEvents = [
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
            },
            category: "Tech",
            type: "In-Person"
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
            },
            category: "Tech",
            type: "Online"
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
            },
            category: "Art",
            type: "In-Person"
        },
        {
            id: 4,
            title: "Afrobeats Festival",
            date: "Mar 12, 2026 • 04:00 PM",
            location: "Tafawa Balewa Square, Lagos",
            imageUrl: "https://images.unsplash.com/photo-1459749411177-287ce112a8bf?q=80&w=2070&auto=format&fit=crop",
            attendeesCount: 5000,
            organizer: {
                name: "Vibe Africa",
                avatarUrl: "https://ui-avatars.com/api/?name=Vibe+Africa&background=random"
            },
            category: "Music",
            type: "In-Person"
        },
        {
            id: 5,
            title: "Startup Pitch Night",
            date: "Mar 25, 2026 • 06:00 PM",
            location: "The Zone, Gbagada",
            imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2070&auto=format&fit=crop",
            attendeesCount: 150,
            organizer: {
                name: "Tech Circle",
                avatarUrl: "https://ui-avatars.com/api/?name=Tech+Circle&background=random"
            },
            category: "Business",
            type: "In-Person"
        },
        {
            id: 6,
            title: "Community Yoga",
            date: "Apr 02, 2026 • 07:00 AM",
            location: "Lekki Conservation Centre",
            imageUrl: "https://images.unsplash.com/photo-1544367563-12123d8975b9?q=80&w=2070&auto=format&fit=crop",
            attendeesCount: 40,
            organizer: {
                name: "Wellness Hub",
                avatarUrl: "https://ui-avatars.com/api/?name=Wellness+Hub&background=random"
            },
            category: "Social",
            type: "In-Person"
        }
    ]

    return (
        <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="flex flex-col gap-4">
                <h1 className="text-4xl font-bold text-white">Explore Events</h1>
                <p className="text-white/60 max-w-2xl">Discover the best events happening around you and online. Join the community and start connecting.</p>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-3xl">
                {/* Search */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search events..."
                        className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all"
                    />
                </div>

                <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                    {/* Category Filter */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeCategory === cat
                                    ? "bg-white text-black"
                                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Secondary Filters (Location/Sort) */}
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {locations.map((loc) => (
                    <button
                        key={loc}
                        onClick={() => setActiveLocation(loc)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${activeLocation === loc
                            ? "bg-white/10 border-white/40 text-white"
                            : "bg-transparent border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                            }`}
                    >
                        {loc === "Nearest to me" && <MapPin className="w-3 h-3" />}
                        {loc}
                    </button>
                ))}
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allEvents.map((event) => (
                    <EventCard key={event.id} {...event} />
                ))}
            </div>
        </div>
    )
}

export default EventsPage