import Image from "next/image"
import { Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { formatDate } from "./EventDetails";

interface EventCardProps {
    id: string;
    title: string
    date: string
    location: string
    imageUrl: string
    attendeesCount?: number
    organizers: {
        name: string
        avatarUrl: string
    }[];
    event_hex?: string;
}

const EventCard = ({ title, date, location, imageUrl, attendeesCount = 0, organizers, id, event_hex }: EventCardProps) => {
    const mainOrganizer = organizers?.[0] || { name: "Unknown", avatarUrl: "" };

    return (
        <div className="group relative rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-300 flex flex-col h-full">
            {/* Image Section */}
            <div className="relative h-48 w-full overflow-hidden">
                <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent opacity-60" />

                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 flex items-center gap-2">
                    <Users className="w-3 h-3 text-white/80" />
                    <span className="text-xs font-medium text-white">{attendeesCount} going</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col gap-4 flex-1">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-wider font-medium">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(date)}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white leading-tight group-hover:text-white/90 transition-colors line-clamp-2">
                        {title}
                    </h3>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{location}</span>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/20">
                            <Image src={mainOrganizer.avatarUrl} alt={mainOrganizer.name} fill className="object-cover" />
                        </div>
                        <span className="text-xs text-white/60">By <span className="text-white hover:underline cursor-pointer">{mainOrganizer.name}</span></span>
                    </div>
                    <Link href={`/events/${event_hex || id}`} className="py-2 px-3 text-xs bg-white text-black hover:bg-gray-200 active:scale-95 transition-all duration-300 cursor-pointer hover:scale-105 rounded-full">
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default EventCard
