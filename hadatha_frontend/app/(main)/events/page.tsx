"use client"

import { useState } from "react"
import EventCard from "@/components/miscellneous/EventCard"
import { Search, MapPin } from "lucide-react"
import { useGetAllEventDetails } from "@/hooks/sui/useGetAllEvents"
import LoadingState from "@/components/miscellneous/LoadingState"

const EventsPage = () => {
    const [activeCategory, setActiveCategory] = useState("All")
    const [activeLocation, setActiveLocation] = useState("All")

    const categories = ["All", "Tech", "Art", "Music", "Business", "Social"]
    const locations = ["All", "Online", "In-Person", "Nearest to me"]

    const { events, isLoading, error } = useGetAllEventDetails(1000)
    console.log(events)


    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingState loadingText="Loading Events..." />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-red-400">
                <p>Error loading events: {error.message}</p>
            </div>
        )
    }

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
            {events && events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events?.map((event) => (
                        <EventCard key={event.id} {...event} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-white/40">
                    <p className="text-xl">No events found</p>
                    <p className="text-sm">Try adjusting your filters or check back later</p>
                </div>
            )}
        </div>
    )
}

export default EventsPage