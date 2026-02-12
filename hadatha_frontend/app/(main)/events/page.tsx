"use client"

import { useState, useMemo } from "react"
import EventCard from "@/components/miscellneous/EventCard"
import { Search, MapPin } from "lucide-react"
import { useGetAllEventDetails } from "@/hooks/sui/useGetAllEvents"
import LoadingState from "@/components/miscellneous/LoadingState"
import { AVAILABLE_TAGS } from "@/components/events/create/TagMultiSelect"

const EventsPage = () => {
    const [activeCategory, setActiveCategory] = useState("All")
    const [activeLocation, setActiveLocation] = useState("All")
    const [eventStatus, setEventStatus] = useState<"ongoing" | "past">("ongoing")
    const [searchQuery, setSearchQuery] = useState("")

    const categories = ["All", ...AVAILABLE_TAGS]
    const locations = ["All", "Online", "In-Person", "Nearest to me"]

    const { events, isLoading, error } = useGetAllEventDetails(1000)

    // Filter events based on status, category, location, and search query
    const filteredEvents = useMemo(() => {
        if (!events) return []

        return events.filter((event) => {
            // Filter out hidden events
            if (event.status === "hidden") return false

            // Filter by ongoing or past
            const isOngoing = new Date(event.end_time) >= new Date()
            if (eventStatus === "ongoing") {
                if (!isOngoing) return false
            } else {
                if (isOngoing) return false
            }

            // Filter by active category
            if (activeCategory !== "All") {
                if (!event.tags?.includes(activeCategory)) return false
            }

            // Filter by active location
            if (activeLocation !== "All") {
                const loc = event.location?.toLowerCase() || ""
                if (activeLocation === "Online") {
                    if (!loc.includes("online") && !loc.includes("remote") && !loc.includes("virtual")) return false
                } else if (activeLocation === "In-Person") {
                    if (loc.includes("online") || loc.includes("remote") || loc.includes("virtual")) return false
                }
                // "Nearest to me" is a placeholder for now as we don't have user location
            }

            // Filter by search query
            if (searchQuery.trim() !== "") {
                const query = searchQuery.toLowerCase()
                const title = event.title?.toLowerCase() || ""
                const description = event.description?.toLowerCase() || ""
                const location = event.location?.toLowerCase() || ""
                if (!title.includes(query) && !description.includes(query) && !location.includes(query)) return false
            }

            return true
        })
    }, [events, eventStatus, activeCategory, activeLocation, searchQuery])

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

            {/* Event Status Toggle */}
            <div className="flex gap-2 bg-white/5 backdrop-blur-md border border-white/10 p-2 rounded-full w-fit">
                <button
                    onClick={() => setEventStatus("ongoing")}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${eventStatus === "ongoing"
                        ? "bg-white text-black"
                        : "text-white/60 hover:text-white"
                        }`}
                >
                    Ongoing Events
                </button>
                <button
                    onClick={() => setEventStatus("past")}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${eventStatus === "past"
                        ? "bg-white text-black"
                        : "text-white/60 hover:text-white"
                        }`}
                >
                    Past Events
                </button>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-3xl">
                {/* Search */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
            {filteredEvents && filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                        <EventCard key={event.id} {...event} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-white/40">
                    <p className="text-xl">No {eventStatus} events found</p>
                    <p className="text-sm">
                        {eventStatus === "ongoing"
                            ? "Try checking past events or adjusting your filters"
                            : "Check back for upcoming events"}
                    </p>
                </div>
            )}
        </div>
    )
}

export default EventsPage