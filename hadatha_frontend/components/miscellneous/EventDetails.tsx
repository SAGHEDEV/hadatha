"use client"

import { useState } from "react"
import { Event } from "@/types";
import { Calendar, Clock, Globe, MapPin, Share2, Edit, Users, Image as ImageIcon, QrCode, Settings, CheckCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RegistrationModal } from "@/components/events/RegistrationModal";
import Link from "next/link";
import CheckInModal from "../events/CheckinModal";
import { CreateNFTModal } from "../events/CreateNFTModal";
import GeneratedQrModal from "../events/GeneratedQrModal";
import ShareModal from "./ShareModal";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useGetDerivedAddress } from "@/hooks/sui/useCheckAccountExistence";
import { useToggleAllowCheckin } from "@/hooks/sui/useCheckin";
import StatusModal from "./StatusModal";
import { useRouter } from "next/navigation";
import { useMintAttendanceNFT } from "@/hooks/sui/useMintAttendeeNFT";

// Helper function to format date
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });

    // Get ordinal suffix
    const getOrdinal = (n: number) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return `${getOrdinal(day)} ${month} ${year}, ${weekday}`;
};

// Helper function to format time
const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr}${ampm}`;
};

const EventDetails = ({ event, preview = false }: { event: Event, preview?: boolean }) => {
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)
    const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false)
    const [isCreateNFTModalOpen, setIsCreateNFTModalOpen] = useState(false)
    const [isGeneratedQrModalOpen, setIsGeneratedQrModalOpen] = useState(false)
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)
    const currentAccount = useCurrentAccount()
    const derivedAddress = useGetDerivedAddress(currentAccount?.address)
    const [actionEffect, setActionEffect] = useState({ open: false, type: "success" as "success" | "error", title: "", description: "" })
    const { toggleAllowCheckin, isToggling } = useToggleAllowCheckin()
    const { mintNFT, isMinting } = useMintAttendanceNFT()
    const router = useRouter()

    // Check if current user is an organizer
    const isOrganizer = currentAccount && event?.organizers.some(org => org.address === currentAccount?.address);

    // Check if user is already registered
    const isRegistered = derivedAddress && currentAccount?.address && event?.attendees?.includes(currentAccount?.address);

    // Check if user has checked in
    const isCheckedIn = currentAccount?.address && event?.attendeeDetails?.some(
        (attendee) => attendee.address === currentAccount?.address && attendee?.checkedIn
    );

    // Check if user has minted NFT
    const hasMinNFT = currentAccount?.address && event?.attendeeDetails?.some(
        (attendee) => attendee.address === currentAccount?.address && attendee?.nftMinted
    );

    // Check if event is full
    const isEventFull = (event?.attendeesCount || 0) >= (event?.maxAttendees || 0);

    // Check if event has started
    const hasEventStarted = new Date(event.start_time) <= new Date();

    // Check if event has ended
    const hasEventEnded = new Date(event.end_time) <= new Date();

    return (
        <div className="flex flex-col gap-8">
            {!preview && <Button className="w-fit" onClick={() => router.push("/events")}>Back to Events</Button>}
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
                            <button
                                onClick={() => setIsShareModalOpen(true)}
                                className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all cursor-pointer"
                            >
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
                                <span>{preview ? event.date : formatDate(event.date)}</span>
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
                                {event.attendeeDetails?.slice(0, 5).map((detail, i) => (
                                    <div key={i} className="relative w-12 h-12 rounded-full border-2 border-black overflow-hidden">
                                        <Image src={detail.avatarUrl} alt="Attendee" fill className="object-cover" />
                                    </div>
                                ))}
                            </div>
                            {event.attendeesCount === 0 ? (
                                <span className="text-white/60 text-sm">No one has registered yet</span>
                            ) : (
                                <span className="text-white/60 text-sm">
                                    {event.attendeesCount} {event.attendeesCount === 1 ? 'person' : 'people'} registered
                                </span>
                            )}
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
                                    <span className="text-white font-medium">{preview ? event.date : formatDate(event.date)}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white/60 text-sm">Time</span>
                                    <span className="text-white font-medium">
                                        {preview ? event.start_time : formatTime(event.start_time)} - {preview ? event.end_time : formatTime(event.end_time)}
                                    </span>
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
                                    <span className="text-white font-medium text-xl">{Number(event.price) == 0 ? "Free" : event.price}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white/60 text-sm">Capacity</span>
                                    <span className="text-white font-medium">
                                        {event.attendeesCount || 0} / {event.maxAttendees || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-white/10 my-2"></div>

                        {/* Show different buttons based on user role */}
                        <div className="flex flex-col gap-4">
                            {!currentAccount && (
                                <>
                                    <p className="text-center text-sm text-white/70">
                                        Please connect your wallet to register for this event.
                                    </p>
                                </>
                            )}

                            {/* Buttons for regular users (non-organizers) */}
                            {currentAccount && !isOrganizer && (
                                <>
                                    {/* Registration Button */}
                                    {!isRegistered && !hasEventEnded && (
                                        <Button
                                            onClick={() => setIsRegistrationModalOpen(true)}
                                            disabled={isEventFull || preview}
                                            className="w-full rounded-full py-6 text-lg font-semibold bg-white text-black hover:bg-gray-200 active:scale-95 transition-all hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        >
                                            {isEventFull ? 'Event Full' : 'Register Now'}
                                        </Button>
                                    )}

                                    {/* Already Registered Message */}
                                    {isRegistered && !isCheckedIn && (
                                        <div className="w-full rounded-full py-3 text-lg font-semibold bg-green-600/10 text-green-400 border border-green-500/50 text-center">
                                            ✓ You&apos;re Registered
                                        </div>
                                    )}

                                    {/* Already Checked In Message */}
                                    {isCheckedIn && (
                                        <div className="w-full rounded-full py-3 text-lg font-semibold bg-blue-600/10 text-blue-400 border border-blue-500/50 text-center flex items-center justify-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            Already Checked In
                                        </div>
                                    )}

                                    {/* Check-in Button - Only show if registered, not checked in, event ongoing, and check-in allowed */}
                                    {isRegistered && !isCheckedIn && !hasEventEnded && event.allowCheckin && (
                                        <Button
                                            onClick={() => setIsCheckInModalOpen(true)}
                                            disabled={preview}
                                            className="w-full rounded-full py-6 text-lg font-semibold bg-green-700 text-white hover:bg-green-600 active:scale-95 transition-all hover:scale-105 cursor-pointer"
                                        >
                                            Check In Now
                                        </Button>
                                    )}

                                    {/* Check-in Status Messages */}
                                    {isRegistered && !isCheckedIn && !hasEventEnded && !event.allowCheckin && (
                                        <p className="text-center text-white/60 text-sm">
                                            Check-in is not available yet
                                        </p>
                                    )}

                                    {isRegistered && !isCheckedIn && hasEventEnded && (
                                        <p className="text-center text-white/60 text-sm">
                                            Event has ended. Check-in is no longer available.
                                        </p>
                                    )}

                                    {/* Mint NFT Button - Only show if checked in, event ended, and not minted yet */}
                                    {isCheckedIn && hasEventEnded && !hasMinNFT && (
                                        <Button
                                            onClick={() => mintNFT({ eventId: event.id, accountId: derivedAddress! })}
                                            disabled={preview || isMinting}
                                            className="w-full rounded-full py-6 text-lg font-semibold bg-purple-700 text-white hover:bg-purple-600 active:scale-95 transition-all hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isMinting ? "Minting NFT..." : "Mint Attendance NFT"}
                                        </Button>
                                    )}

                                    {/* NFT Already Minted Message */}
                                    {hasMinNFT && (
                                        <div className="w-full rounded-full py-3 text-lg font-semibold bg-purple-600/10 text-purple-400 border border-purple-500/50 text-center flex items-center justify-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            NFT Minted
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {!hasEventEnded && event.attendeesCount! < event.maxAttendees! && (
                            <p className="text-center text-white/40 text-xs">
                                {event.maxAttendees! - event.attendeesCount!} spots remaining
                            </p>
                        )}
                    </div>

                    {/* Organizer Settings - Only visible to organizers */}
                    {!preview && currentAccount && isOrganizer && (
                        <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] flex flex-col gap-6">
                            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                                <Settings className="w-5 h-5 text-white/80" />
                                <h2 className="text-xl font-bold text-white">Organizer Settings</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <Button
                                    className="w-full rounded-xl py-6 text-base font-medium bg-white/10 text-white border border-white/10 hover:bg-white/20 hover:border-white/30 transition-all cursor-pointer justify-start px-4"
                                    disabled={hasEventEnded}
                                >
                                    <Edit className="w-4 h-4 mr-3 text-blue-400" />
                                    Edit Event Details
                                </Button>

                                <Link
                                    href={`/events/${event.id}/registrations`}
                                    className="w-full rounded-xl py-3 text-base font-medium bg-white/10 text-white border border-white/10 hover:bg-white/20 hover:border-white/30 transition-all cursor-pointer flex items-center justify-start px-4"
                                >
                                    <Users className="w-4 h-4 mr-3 text-green-400" />
                                    View Registrations ({event.attendeesCount || 0})
                                </Link>

                                <Button
                                    className="w-full rounded-xl py-6 text-base font-medium bg-white/10 text-white border border-white/10 hover:bg-white/20 hover:border-white/30 transition-all cursor-pointer justify-start px-4"
                                    onClick={() => setIsCreateNFTModalOpen(true)}
                                >
                                    <ImageIcon className="w-4 h-4 mr-3 text-purple-400" />
                                    Setup Attendance NFT
                                </Button>

                                <Button
                                    className="w-full rounded-xl py-6 text-base font-medium bg-white/10 text-white border border-white/10 hover:bg-white/20 hover:border-white/30 transition-all cursor-pointer justify-start px-4"
                                    onClick={() => setIsGeneratedQrModalOpen(true)}
                                >
                                    <QrCode className="w-4 h-4 mr-3 text-yellow-400" />
                                    Check-in QR Code
                                </Button>

                                <p className="pb-4 border-b border-white/10">Check-in Settings</p>
                                {/* <Button
                                    className="w-full rounded-xl py-6 text-base font-medium bg-white/10 text-white border border-white/10 hover:bg-white/20 hover:border-white/30 transition-all cursor-pointer justify-start px-4"
                                    onClick={() => setIsCheckInModalOpen(true)}
                                >
                                    <Users className="w-4 h-4 mr-3 text-green-400" />
                                    Manual Check-in
                                </Button> */}
                                <Button
                                    className={`w-full py-6 text-base font-medium text-center rounded-full ${event.allowCheckin ? "bg-red-600 text-white hover:bg-red-400" : "bg-green-600 text-white hover:bg-green-400"} transition-all cursor-pointer justify-center px-4 ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
                                    onClick={async () => {
                                        try {
                                            await toggleAllowCheckin(event.id)
                                            setActionEffect({
                                                open: true,
                                                title: event.allowCheckin ? "Check-in Disabled" : "Check-in Enabled",
                                                description: event.allowCheckin ? "Attendees can no longer check in" : "Attendees can now check in to the event",
                                                type: "success",
                                            })
                                        } catch (error) {
                                            console.log(error)
                                            setActionEffect({
                                                open: true,
                                                title: "An error occurred",
                                                description: "Failed to toggle check-in settings",
                                                type: "error"
                                            })
                                        }
                                    }}
                                    disabled={isToggling || hasEventEnded}
                                >
                                    {isToggling ? "Updating..." : event.allowCheckin ? "Disable Check-in" : "Enable Check-in"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <CheckInModal
                title={event.title}
                open={isCheckInModalOpen}
                setOpen={setIsCheckInModalOpen}
            />
            <RegistrationModal
                event={event}
                isOpen={isRegistrationModalOpen}
                setIsOpen={setIsRegistrationModalOpen}
            />
            <CreateNFTModal
                eventTitle={event.title}
                eventId={event.id}
                onSuccess={() => setIsCreateNFTModalOpen(false)}
                isOpen={isCreateNFTModalOpen}
                setOpen={setIsCreateNFTModalOpen}
            />
            <GeneratedQrModal
                title={event.title}
                open={isGeneratedQrModalOpen}
                setOpen={setIsGeneratedQrModalOpen}
                eventId={event.id}
            />
            <ShareModal
                event={event}
                open={isShareModalOpen}
                setOpen={setIsShareModalOpen}
            />
            <StatusModal
                isOpen={actionEffect.open}
                onClose={() => setActionEffect((prev) => ({ ...prev, open: false }))}
                type={actionEffect.type}
                title={actionEffect.title}
                description={actionEffect.description}
            />
        </div>
    )
}

export default EventDetails