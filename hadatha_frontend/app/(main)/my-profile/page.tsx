"use client"

import { useCheckAccountExistence } from "@/hooks/sui/useCheckAccountExistence"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { Loader2, Edit, Calendar, Award, Users, LayoutDashboard, Ticket } from "lucide-react"
import { useState } from "react"
import EditProfileModal from "@/components/profile/EditProfileModal"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGetEventsByOrganizer } from "@/hooks/sui/useGetAllEvents"
import StatsCard from "@/components/miscellneous/StatsCard"
import EventCard from "@/components/miscellneous/EventCard"
import { Twitter, Github, Globe, ExternalLink } from "lucide-react"
import CreateAccountForm from '@/components/profile/CreateAccountForm';

export default function ProfilePage() {
    const currentAccount = useCurrentAccount()
    const { hasAccount, isLoading, account, refetch } = useCheckAccountExistence()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const { events: organizedEvents, isLoading: organizedLoading } = useGetEventsByOrganizer(currentAccount?.address || "")

    if (!currentAccount) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <LayoutDashboard className="w-12 h-12 text-white/20" />
                <p className="text-white/60 font-medium">Please connect your wallet to view your profile.</p>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <p className="text-white/60 animate-pulse">Loading your on-chain identity...</p>
            </div>
        )
    }

    if (!hasAccount) {
        return <div className="flex justify-center items-center">
            <CreateAccountForm onSuccess={refetch} />
        </div>
    }

    return (
        <div className="min-h-screen pb-20">
            <div className="w-full mx-auto px-4 md:px-6 lg:px-8">
                {/* Cover & Profile Header */}
                <div className="relative mb-8">
                    {/* Cover Background */}
                    <div className="hidden md:block md:h-38 lg:h-52 w-full bg-white/5 rounded-3xl border border-white/10 overflow-hidden relative">
                        <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent" />
                    </div>

                    {/* Profile Card - Overlapping Cover */}
                    <div className="w-full mx-auto px-0 md:px-6 lg:px-8">
                        <div className="relative md:-mt-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
                            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                                {/* Profile Picture */}
                                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-black/50 bg-white/10 shadow-xl shrink-0">
                                    {account?.image_url ? (
                                        <Image
                                            src={account.image_url}
                                            alt={account.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/40 text-4xl sm:text-5xl font-bold">
                                            {account?.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                {/* Profile Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full">
                                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight wrap-break-word max-w-full">
                                                {account?.name}
                                            </h1>
                                            <div className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-[10px] text-white/60 font-bold uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap shrink-0">
                                                <Award className="w-3.5 h-3.5 text-white/40" />
                                                Verified
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => setIsEditModalOpen(true)}
                                            className="bg-white text-black hover:bg-white/90 rounded-full px-6 h-10 font-semibold transition-all self-start sm:self-auto cursor-pointer"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Profile
                                        </Button>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm">
                                        <p className="text-white/70 font-medium truncate max-w-full">{account?.email}</p>
                                        <span className="hidden sm:block w-1 h-1 rounded-full bg-white/30" />
                                        <div className="flex items-center gap-2 text-white/50 shrink-0">
                                            <Calendar className="w-4 h-4" />
                                            <span>Joined {new Date().toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className=" mx-auto px-0 md:px-6 lg:px-8 mt-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* About Section */}
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                                <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">About</h3>
                                <p className="text-white/80 leading-relaxed text-sm">
                                    {account?.bio || "No bio yet. Tell the world who you are!"}
                                </p>
                            </div>

                            {/* Social Links */}
                            {(account?.twitter || account?.github || account?.website) && (
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                                    <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Connect with me</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {account?.twitter && (
                                            <a
                                                href={`https://twitter.com/${account.twitter}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-sky-500/10 hover:border-sky-500/30 transition-all group cursor-pointer"
                                            >
                                                <Twitter className="w-5 h-5 text-white/60 group-hover:text-sky-400 transition-colors" />
                                            </a>
                                        )}
                                        {account?.github && (
                                            <a
                                                href={`https://github.com/${account.github}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all group cursor-pointer"
                                            >
                                                <Github className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                                            </a>
                                        )}
                                        {account?.website && (
                                            <a
                                                href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group cursor-pointer"
                                            >
                                                <Globe className="w-5 h-5 text-white/60 group-hover:text-emerald-400 transition-colors" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* On-chain Identity */}
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Wallet Identity</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-white/20 transition-all">
                                            <div className="w-2.5 h-2.5 rounded-full bg-white/40 animate-pulse shrink-0" />
                                            <span title={currentAccount?.address} className="text-sm text-white font-mono break-all selection:bg-white selection:text-black truncate">
                                                {currentAccount?.address}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-white/30 font-medium px-1">
                                            This is your unique Sui blockchain identifier.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Account Object</h3>
                                    <a
                                        href={`https://suivision.xyz/object/${account?.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-white/20 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 shrink-0" />
                                            <span className="text-xs text-white/70 font-mono truncate">
                                                {account?.id}
                                            </span>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white transition-colors shrink-0" />
                                    </a>
                                    <p className="mt-3 text-[10px] text-white/30 font-medium px-1">
                                        Verify your account data on SuiVision explorer.
                                    </p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="space-y-3">
                                <StatsCard
                                    title="Events Organized"
                                    value={account?.total_organized || 0}
                                    icon={Users}
                                    description="Events created"
                                />
                                <StatsCard
                                    title="Events Attended"
                                    value={account?.total_attended || 0}
                                    icon={Award}
                                    description="Past attendance"
                                />
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <Tabs defaultValue="managed" className="w-full">
                                <TabsList className="bg-white/5 border border-white/10 rounded-full p-1 mb-6 sm:w-auto backdrop-blur-sm h-full w-full overflow-x-auto no-scroll">
                                    <TabsTrigger
                                        value="managed"
                                        className="rounded-full px-6 py-2.5! text-sm text-white font-semibold data-[state=active]:bg-white data-[state=active]:text-black transition-all cursor-pointer"
                                    >
                                        <LayoutDashboard className="w-4 h-4 mr-2" />
                                        My Events
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="registered"
                                        className="rounded-full text-white px-6 py-2.5 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-black transition-all cursor-pointer"
                                    >
                                        <Ticket className="w-4 h-4 mr-2" />
                                        Calendar
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="managed" className="mt-0">
                                    {organizedLoading ? (
                                        <div className="flex flex-col items-center justify-center py-24 bg-white/5 rounded-2xl border border-white/10">
                                            <Loader2 className="w-8 h-8 animate-spin text-white/30 mb-4" />
                                            <p className="text-white/50 font-medium text-sm">Loading events...</p>
                                        </div>
                                    ) : organizedEvents.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        <div className="flex flex-col items-center justify-center py-24 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                                                <LayoutDashboard className="w-8 h-8 text-white/20" />
                                            </div>
                                            <p className="text-white/70 font-semibold text-lg mb-1">No events yet</p>
                                            <p className="text-white/40 text-sm mb-6 text-center max-w-xs">
                                                Start organizing events and they&apos;ll appear here
                                            </p>
                                            <Button className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-10 font-semibold cursor-pointer">
                                                Create Event
                                            </Button>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="registered" className="mt-0">
                                    <div className="flex flex-col items-center justify-center py-24 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                                            <Ticket className="w-8 h-8 text-white/20" />
                                        </div>
                                        <p className="text-white/70 font-semibold text-lg mb-1">No upcoming events</p>
                                        <p className="text-white/40 text-sm mb-6 text-center max-w-xs">
                                            Your registered events will appear here
                                        </p>
                                        <Button
                                            variant="outline"
                                            className="border-white/20 text-black hover:text-white hover:bg-white/5 hover:border-white/30 transition-all duration-300 rounded-full px-8 h-10 font-semibold cursor-pointer"
                                        >
                                            Explore Events
                                        </Button>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                setIsOpen={setIsEditModalOpen}
                currentProfile={account}
                onSuccess={refetch}
            />
        </div>
    )
}