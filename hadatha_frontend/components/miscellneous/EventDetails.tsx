"use client";

import Link from "next/link";
import { useState } from "react";
import { Event } from "@/types";
import {
    Calendar,
    Clock,
    Globe,
    MapPin,
    Share2,
    Users,
    CheckCircle,
    Settings,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import LaunchAppBtn from "./LaunchAppBtn";
import { RegistrationModal } from "@/components/events/RegistrationModal";
import CheckInModal from "../events/CheckinModal";
import ShareModal from "./ShareModal";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { normalizeSuiAddress } from "@mysten/sui/utils";
import { useGetDerivedAddress } from "@/hooks/sui/useCheckAccountExistence";
import { useRouter } from "next/navigation";
import { useMintAttendanceNFT } from "@/hooks/sui/useMintAttendeeNFT";
import { EventMap } from "../events/EventMap";
import { formatAmount, getCurrencyLabel } from "@/lib/coin";

// Helper function to format date
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const year = date.getFullYear();
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });

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
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutesStr}${ampm}`;
};

const EventDetails = ({
    event,
    preview = false,
    onRegisterSuccess,
}: {
    event: Event;
    preview?: boolean;
    onRegisterSuccess?: () => void;
}) => {
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
    const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const currentAccount = useCurrentAccount();
    const derivedAddress = useGetDerivedAddress(currentAccount?.address);
    const { mintNFT, isMinting } = useMintAttendanceNFT();
    const router = useRouter();

    // Check if current user is an organizer
    const isOrganizer =
        currentAccount &&
        event?.organizers.some((org) => normalizeSuiAddress(org.address) === normalizeSuiAddress(currentAccount?.address));

    const [hasJustRegistered, setHasJustRegistered] = useState(false);

    // Check if user is already registered (strict check)
    // We also check local state to handle optimistic updates immediately after registration
    const isRegistered =
        hasJustRegistered ||
        (currentAccount?.address &&
            event?.attendees?.some(addr => normalizeSuiAddress(addr) === normalizeSuiAddress(currentAccount.address || "")));

    // Handle registration success
    const handleRegisterSuccess = () => {
        setHasJustRegistered(true);
        if (onRegisterSuccess) {
            onRegisterSuccess();
        }
    };

    // Check if user has checked in
    const isCheckedIn =
        currentAccount?.address &&
        event?.attendeeDetails?.some(
            (attendee) =>
                normalizeSuiAddress(attendee.address) === normalizeSuiAddress(currentAccount?.address || "") && attendee?.checkedIn
        );

    // Find attendee detail for current user to get their ticket tier
    const userAttendeeDetail = event?.attendeeDetails?.find(
        (attendee) => normalizeSuiAddress(attendee.address) === normalizeSuiAddress(currentAccount?.address || "")
    );

    const userTicketTierName = userAttendeeDetail && event.ticket_tiers && event.ticket_tiers[userAttendeeDetail.ticketTierIndex]
        ? event.ticket_tiers[userAttendeeDetail.ticketTierIndex].name
        : null;

    // Check if user has minted NFT
    const hasMinNFT =
        currentAccount?.address &&
        event?.attendeeDetails?.some(
            (attendee) =>
                attendee.address === currentAccount?.address && attendee?.nftMinted
        );

    // Check if event is full
    // Optimistically update capacity if just registered
    const currentAttendeesCount = hasJustRegistered ? (event?.attendeesCount || 0) + 1 : (event?.attendeesCount || 0);
    const isEventFull = currentAttendeesCount >= (event?.maxAttendees || 0);

    // Check if event has ended
    const hasEventEnded = new Date(event.end_time) <= new Date();

    // Parse Coordinates
    const latTag = event.tags?.find(tag => tag.startsWith("lat:"))
    const lngTag = event.tags?.find(tag => tag.startsWith("lng:"))
    const latitude = latTag ? parseFloat(latTag.split(":")[1]) : null
    const longitude = lngTag ? parseFloat(lngTag.split(":")[1]) : null

    // Ticket Tiers
    const ticketTiers = event.ticket_tiers || []

    console.log(event)


    return (
        <div className="flex flex-col gap-8">
            {!preview && (
                <Button className="w-fit" onClick={() => router.push("/events")}>
                    Back to Events
                </Button>
            )}
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
                        {!preview && (
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={() => setIsShareModalOpen(true)}
                                    className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all cursor-pointer"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        )}
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

                    {/* Event Map */}
                    {latitude && longitude && (
                        <div className="flex flex-col gap-4">
                            <h2 className="text-2xl font-bold text-white">Location Map</h2>
                            <EventMap lat={latitude} lng={longitude} className="h-[300px]" />
                        </div>
                    )}

                    {/* Tags */}
                    {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-col gap-4">
                            <h2 className="text-2xl font-bold text-white">Tags</h2>
                            <div className="flex flex-wrap gap-2">
                                {event.tags.filter(tag => !tag.startsWith("lat:") && !tag.startsWith("lng:")).map((tag, index) => (
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
                        <h3 className="text-xl font-bold text-white pb-4 border-b border-white/20">{preview ? "Co-" : ""}Organizers</h3>
                        <div className="flex gap-2 items-center justify-start">
                            <div className="flex items-center">
                                {event.organizers.map((organizer, index) => (
                                    <Link
                                        key={index}
                                        href={`/profile/${organizer.address}`}
                                        className="relative w-8 h-8 rounded-full overflow-hidden bg-black border border-white/20 -ml-2 first-of-type:ml-0 hover:z-10 transition-transform hover:scale-110"
                                    >
                                        <Image
                                            src={organizer.avatarUrl}
                                            alt={organizer.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </Link>
                                ))}
                            </div>
                            {(event.organizers && event.organizers.length > 0) ? event.organizers.map((organizer, index) => (
                                <Link
                                    key={index}
                                    href={`/profile/${organizer.address}`}
                                    className="relative hover:text-white transition-colors"
                                >
                                    {" "}
                                    {organizer.name}
                                    {index < event.organizers.length - 1 ? ", " : ""}
                                </Link>
                            )) : <span>No organizers Selected</span>}
                        </div>
                    </div>

                    {/* Attendees Preview */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-xl font-bold text-white">Attendees</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-4">
                                {event.attendeeDetails?.slice(0, 5).map((detail, i) => (
                                    <div
                                        key={i}
                                        className="relative w-12 h-12 rounded-full border-2 border-black overflow-hidden bg-gray-800"
                                    >
                                        <Image
                                            src={detail?.avatarUrl || `https://ui-avatars.com/api/?name=${detail.address.slice(0, 2)}&background=random`}
                                            alt="Attendee"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                            {event.attendeesCount === 0 ? (
                                <span className="text-white/60 text-sm">
                                    No one has registered yet
                                </span>
                            ) : (
                                <span className="text-white/60 text-sm">
                                    {event.attendeesCount}{" "}
                                    {event.attendeesCount === 1 ? "person" : "people"} registered
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Sticky Sidebar */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="sticky top-32 p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-xl font-bold text-white">Event Details</h3>
                            {event.event_hex && (
                                <div className="flex items-center gap-2">
                                    <span className="text-white/40 text-xs font-mono">ID: {event.event_hex}</span>
                                    <Link
                                        href={`https://suiscan.xyz/testnet/object/${event.id}`}
                                        target="_blank"
                                        className="text-[10px] text-blue-400 hover:text-blue-300 underline"
                                    >
                                        View on Explorer
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white/60 text-sm">Date</span>
                                    <span className="text-white font-medium">
                                        {preview ? event.date : formatDate(event.date)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white/60 text-sm">Time</span>
                                    <span className="text-white font-medium">
                                        {preview ? event.start_time : formatTime(event.start_time)}{" "}
                                        - {preview ? event.end_time : formatTime(event.end_time)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white/60 text-sm">Location</span>
                                    <span className="text-white font-medium">
                                        {event.location}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <Globe className="w-5 h-5 text-white" />
                                </div>
                                <div className="w-full flex flex-col">
                                    <span className="text-white/60 text-sm">Price</span>
                                    {ticketTiers.length > 0 && !(ticketTiers.length === 1 && Number(ticketTiers[0].price) === 0) ? (
                                        <div className="flex flex-col gap-2 mt-2 w-full">
                                            {ticketTiers.map((tier, i) => (
                                                <div key={i} className="w-full flex justify-between items-center text-sm bg-white/5 p-2 rounded-lg border border-white/5">
                                                    <div className="w-full flex flex-col">
                                                        <span className="text-white/80">{tier.name}</span>
                                                        <span className="text-white/40 text-xs">{tier.quantity || 0} available</span>
                                                    </div>
                                                    <div className="w-full max-w-fit text-amber-400 font-mono font-medium">
                                                        {Number(tier.price) === 0 ? "Free" : `${formatAmount(tier.price)} ${getCurrencyLabel(tier.currency || "SUI")}`}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-white font-medium text-xl">Free</span>
                                    )}
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
                                <div className="flex flex-col gap-4 items-center p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 mb-2">
                                        <Users className="w-6 h-6 text-white/40" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-white font-bold text-lg">Connect Wallet to Register</p>
                                        <p className="text-sm text-white/60">
                                            Connect your wallet to register for this event as a guest or member.
                                        </p>
                                    </div>
                                    <div className="w-full pt-2">
                                        <LaunchAppBtn
                                            buttonText="Connect Wallet"
                                            redirectUrl={`/events/${event.id}`}
                                        />
                                    </div>
                                </div>
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
                                            {isEventFull ? "Event Full" : "Register Now"}
                                        </Button>
                                    )}

                                    {/* Already Registered Message */}
                                    {isRegistered && !isCheckedIn && (
                                        <div className="w-full rounded-full py-3 text-lg font-semibold bg-green-600/10 text-green-400 border border-green-500/50 text-center truncate px-3">
                                            ✓ Registered {userTicketTierName ? `as ${userTicketTierName}` : ""}
                                        </div>
                                    )}

                                    {/* Already Checked In Message */}
                                    {isCheckedIn && (
                                        <div className="w-full rounded-full py-3 text-lg font-semibold bg-blue-600/10 text-blue-400 border border-blue-500/50 text-center flex items-center justify-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            Checked In {userTicketTierName ? `(${userTicketTierName})` : ""}
                                        </div>
                                    )}

                                    {/* Check-in Button - Only show if registered, not checked in, event ongoing, and check-in allowed */}
                                    {isRegistered &&
                                        !isCheckedIn &&
                                        !hasEventEnded &&
                                        event.allowCheckin && (
                                            <Button
                                                onClick={() => setIsCheckInModalOpen(true)}
                                                disabled={preview}
                                                className="w-full rounded-full py-6 text-lg font-semibold bg-green-700 text-white hover:bg-green-600 active:scale-95 transition-all hover:scale-105 cursor-pointer"
                                            >
                                                Check In Now
                                            </Button>
                                        )}

                                    {/* Check-in Status Messages */}
                                    {isRegistered &&
                                        !isCheckedIn &&
                                        !hasEventEnded &&
                                        !event.allowCheckin && (
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
                                            onClick={() =>
                                                mintNFT({
                                                    eventId: event.id,
                                                    accountId: derivedAddress || null,
                                                })
                                            }
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
                                <h2 className="text-xl font-bold text-white">
                                    Organizer Actions
                                </h2>
                            </div>

                            <p className="text-white/60 text-sm">
                                Manage registrations, check-in attendees, and update event details.
                            </p>

                            <Button
                                className="w-full rounded-xl py-6 text-base font-semibold bg-white text-black hover:bg-gray-200 active:scale-95 transition-all cursor-pointer"
                                onClick={() => router.push(`/events/${event.id}/manage`)}
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Manage Event
                            </Button>
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
                onRegisterSuccess={handleRegisterSuccess}
            />
            <ShareModal
                event={event}
                open={isShareModalOpen}
                setOpen={setIsShareModalOpen}
            />
        </div>
    );
};

export default EventDetails;