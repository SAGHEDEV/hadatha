"use client"

import { useCheckAccountExistence } from "@/hooks/sui/useCheckAccountExistence"
import { useParams } from "next/navigation"
import { Loader2, Calendar, Award, LayoutDashboard, Ticket } from "lucide-react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGetEventsByOrganizer } from "@/hooks/sui/useGetAllEvents"
import StatsCard from "@/components/miscellneous/StatsCard"
import EventCard from "@/components/miscellneous/EventCard"
import { Twitter, Github, Globe, ExternalLink } from "lucide-react"

export default function PublicProfilePage() {
    const params = useParams()
    const address = params?.address as string

    const { hasAccount, isLoading, account } = useCheckAccountExistence(address)
    const { events: organizedEvents, isLoading: organizedLoading } = useGetEventsByOrganizer(address || "")

    // If account doesn't exist, we'll still show the page but with default/guest data
    // We only show the loader while checking
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <p className="text-white/60 animate-pulse">Fetching profile from the blockchain...</p>
            </div>
        )
    }

    const displayName = account?.name || "Anonymous User"
    const displayEmail = account?.email || "No email provided"
    const displayBio = account?.bio || "This user hasn't added a bio yet."

    return (
        <div className="max-w-7xl mx-auto py-12 px-6">
            {/* Header / Cover Area */}
            <div className="relative mb-8">
                {/* Cover Background */}
                <div className="h-28 sm:h-38 lg:h-52 w-full bg-white/5 rounded-3xl border border-white/10 overflow-hidden relative">
                    <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent" />
                </div>

                {/* Profile Card - Overlapping Cover */}
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative -mt-20 sm:-mt-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
                        <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                            {/* Profile Picture */}
                            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-black/50 bg-white/10 shadow-xl shrink-0">
                                {account?.image_url ? (
                                    <Image
                                        src={account.image_url}
                                        alt={displayName}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/40 text-4xl sm:text-5xl font-bold">
                                        {displayName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full">
                                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight wrap-break-word max-w-full">
                                            {displayName}
                                        </h1>
                                        {hasAccount && (
                                            <div className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-[10px] text-white/60 font-bold uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap shrink-0">
                                                <Award className="w-3.5 h-3.5 text-white/40" />
                                                On-chain Identity
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm">
                                    <p className="text-white/60 font-medium truncate max-w-full">{displayEmail}</p>
                                    <span className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />
                                    <div className="flex items-center gap-2 text-white/40 text-sm shrink-0">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Member since {new Date().toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Sidebar: Bio & Socials */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 backdrop-blur-sm">
                            <div>
                                <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">
                                    About
                                </h3>
                                <p className="text-white/80 leading-relaxed text-sm">
                                    {displayBio}
                                </p>
                            </div>

                            {/* Social Links */}
                            {(account?.twitter || account?.github || account?.website) && (
                                <div className="pt-6 border-t border-white/10 space-y-4">
                                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">Connect</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {account?.twitter && (
                                            <a href={`https://twitter.com/${account.twitter}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer">
                                                <Twitter className="w-4 h-4 text-white/60 group-hover:text-sky-400" />
                                            </a>
                                        )}
                                        {account?.github && (
                                            <a href={`https://github.com/${account.github}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer">
                                                <Github className="w-4 h-4 text-white/60 group-hover:text-white" />
                                            </a>
                                        )}
                                        {account?.website && (
                                            <a href={account.website.startsWith('http') ? account.website : `https://${account.website}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer">
                                                <Globe className="w-4 h-4 text-white/60 group-hover:text-emerald-400" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* On-chain Details */}
                            <div className="pt-6 border-t border-white/10 space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Wallet Identity</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-white/20 transition-all">
                                            <div className="w-2 rounded-full h-2 bg-white/40 animate-pulse shrink-0" />
                                            <span className="text-xs text-white/80 font-mono break-all selection:bg-white selection:text-black truncate">
                                                {address}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Account Object</h4>
                                    <a
                                        href={`https://suivision.xyz/object/${account?.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-white/20 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500/40 shrink-0" />
                                            <span className="text-[10px] text-white/60 font-mono truncate">
                                                {account?.id}
                                            </span>
                                        </div>
                                        <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-white transition-colors shrink-0" />
                                    </a>
                                    <p className="mt-3 text-[10px] text-white/20 font-medium px-1 leading-tight">
                                        Verify on-chain data for this account on SuiVision.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Group using StatsCard */}
                        <div className="space-y-3">
                            <StatsCard
                                title="Events Managed"
                                value={account?.total_organized || 0}
                                icon={LayoutDashboard}
                                description="Events managed by this user"
                            />
                            <StatsCard
                                title="Events Attended"
                                value={account?.total_attended || 0}
                                icon={Ticket}
                                description="Past event attendances"
                            />
                        </div>
                    </div>

                    {/* Right Area: Activity Tabs */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="managed" className="w-full">
                            <TabsList className="bg-white/5 border border-white/10 rounded-full p-1 mb-6 sm:w-auto backdrop-blur-sm h-full w-full">
                                <TabsTrigger value="managed" className="rounded-full px-6 py-2.5! text-white text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-black transition-all cursor-pointer">
                                    Collected
                                </TabsTrigger>
                                <TabsTrigger value="registered" className="rounded-full text-white px-6 py-2.5! text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-black transition-all cursor-pointer">
                                    Calendar
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="managed">
                                {organizedLoading ? (
                                    <div className="flex flex-col items-center justify-center py-32 bg-white/5 rounded-4xl border border-white/10">
                                        <Loader2 className="w-10 h-10 animate-spin text-white/20 mb-4" />
                                        <p className="text-white/40 font-medium">Fetching events...</p>
                                    </div>
                                ) : organizedEvents.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {organizedEvents.map(event => (
                                            <EventCard
                                                key={event.id}
                                                id={event.id}
                                                title={event.title}
                                                date={event.start_time}
                                                location={event.location}
                                                imageUrl={event.imageUrl}
                                                attendeesCount={event.attendeesCount}
                                                organizers={event.organizers}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-32 bg-white/5 rounded-4xl border border-dashed border-white/10">
                                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                            <LayoutDashboard className="w-10 h-10 text-white/10" />
                                        </div>
                                        <p className="text-white/60 font-bold text-xl mb-2">No active events</p>
                                        <p className="text-white/40 max-w-xs text-center">This user hasn&apos;t organized any events yet.</p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="registered">
                                <div className="flex flex-col items-center justify-center py-32 bg-white/5 rounded-4xl border border-dashed border-white/10">
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                        <Ticket className="w-10 h-10 text-white/10" />
                                    </div>
                                    <p className="text-white/60 font-bold text-xl mb-2">Schedule Private</p>
                                    <p className="text-white/40 max-w-xs text-center">Upcoming registrations are only visible to the profile owner.</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    )
}
