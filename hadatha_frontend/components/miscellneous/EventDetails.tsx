"use client"

import { useState } from "react"
import { Event } from "@/types";
import { Calendar, Clock, Globe, MapPin, Share2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RegistrationModal } from "@/components/events/RegistrationModal";
import Link from "next/link";
import CheckInModal from "../events/CheckinModal";

const EventDetails = ({ event, preview = false }: { event: Event, preview?: boolean }) => {
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)
    const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false)

    return (
        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* Banner Image */}
                    <div className="relative w-full h-[400px] rounded-3xl overflow-hidden border border-white/10">
                        {event.imageUrl ? (
                            <Image
                                src={event.imageUrl}
                                alt={event.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/20">
                                No Image
                            </div>
                        )}
                        {!preview && <div className="absolute top-4 right-4">
                            <button className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>}
                    </div>

                    {/* Title and Quick Stats */}
                    <div className="flex flex-col gap-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            {event.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-white/60">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                <span>{event.location}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-2xl font-bold text-white">About Event</h2>
                        <p className="text-white/70 leading-relaxed text-lg">
                            {event.description}
                        </p>
                    </div>

                    {/* Tags */}
                    {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-col gap-4">
                            <h2 className="text-2xl font-bold text-white">Tags</h2>
                            <div className="flex flex-wrap gap-2">
                                {event.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Organizers */}
                    <div className="flex flex-col gap-4 p-6 rounded-3xl bg-white/5 border border-white/10">
                        <h3 className="text-xl font-bold text-white">Organizers</h3>
                        <div className="flex gap-2 items-center justify-start">
                            <div className="flex items-center">
                                {event.organizers.map((organizer, index) => (
                                    <span key={index} className="relative w-8 h-8 rounded-full overflow-hidden bg-black border border-white/20 -ml-2 first-of-type:ml-0 ">
                                        <Image src={organizer.avatarUrl} alt={organizer.name} fill className="object-cover" />
                                    </span>
                                ))}
                            </div>
                            {event.organizers.map((organizer, index) => (
                                <span key={index} className="relative">
                                    {" "}{organizer.name}{index < event.organizers.length - 1 ? ", " : ""}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Attendees Preview */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-xl font-bold text-white">Attendees</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-4">
                                {event.attendees?.map((url, i) => (
                                    <div key={i} className="relative w-12 h-12 rounded-full border-2 border-black overflow-hidden">
                                        <Image src={url} alt="Attendee" fill className="object-cover" />
                                    </div>
                                ))}
                            </div>
                            <span className="text-white/60 text-sm">
                                +{(event.attendeesCount || 0) - (event.attendees?.length || 0)} others are going
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Column - Sticky Sidebar */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="sticky top-32 p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] flex flex-col gap-6">
                        <h3 className="text-xl font-bold text-white">Event Details</h3>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white/60 text-sm">Date</span>
                                    <span className="text-white font-medium">{event.date}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white/60 text-sm">Time</span>
                                    <span className="text-white font-medium">{event.start_time} - {event.end_time}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white/60 text-sm">Location</span>
                                    <span className="text-white font-medium">{event.location}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <Globe className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white/60 text-sm">Price</span>
                                    <span className="text-white font-medium text-xl">Free</span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-white/10 my-2"></div>
                        <div className="flex flex-col gap-4">
                            <Button
                                onClick={() => setIsRegistrationModalOpen(true)}
                                className="w-full rounded-full py-6 text-lg font-semibold bg-white text-black hover:bg-gray-200 active:scale-95 transition-all hover:scale-105 cursor-pointer"
                            >
                                Register Now
                            </Button>
                            <Button
                                onClick={() => setIsCheckInModalOpen(true)}
                                disabled={preview}
                                className="w-full rounded-full py-6 text-lg font-semibold bg-green-700 text-white hover:bg-green-500 active:scale-95 transition-all hover:scale-105 cursor-pointer"
                            >
                                Checkin
                            </Button>
                        </div>

                        <p className="text-center text-white/40 text-xs">
                            Limited spots available. Registration closes soon.
                        </p>
                    </div>
                    {!preview && <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] flex flex-col gap-6">
                        <h2 className="text-xl font-bold text-white pb-3 border-b border-white/10">Organizers Settings</h2>
                        <div className="flex flex-col gap-3">
                            <Button
                                // onClick={() => setIsRegistrationModalOpen(true)}
                                className="w-full rounded-full py-6 text-lg font-semibold bg-white text-black hover:bg-gray-200 active:scale-95 transition-all hover:scale-105 cursor-pointer"
                            >
                                Edit event Details
                            </Button>
                            <Button
                                className="w-full rounded-full py-6 text-lg font-semibold bg-white text-black hover:bg-gray-200 active:scale-95 transition-all hover:scale-105 cursor-pointer"
                            >
                                Create Attendee NFT
                            </Button>
                            <Link
                                href={`/events/${event.id}/registrations`}
                                className="w-full rounded-full py-2 text-lg font-semibold bg-transparent border border-white/20 text-white hover:bg-white/10 active:scale-95 transition-all hover:scale-105 cursor-pointer flex justify-center items-center"
                            >
                                View Registrations
                            </Link>
                        </div>
                    </div>}
                </div>
            </div>
            <CheckInModal
                title={event.title}
                open={isCheckInModalOpen}
                setOpen={setIsCheckInModalOpen}
            />
            <RegistrationModal
                event={event}
                isOpen={isRegistrationModalOpen}
                onClose={() => setIsRegistrationModalOpen(false)}
            />
        </div>
    )
}

export default EventDetails