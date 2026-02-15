"use client"

import { Button } from "@/components/ui/button"
import { Event } from "@/types"
import { Edit, Image as ImageIcon, QrCode, Power } from "lucide-react"
import Image from "next/image"
import { useToggleAllowCheckin } from "@/hooks/sui/useCheckin"
import { useState } from "react"
import { CreateNFTModal } from "../CreateNFTModal"
import GeneratedQrModal from "../GeneratedQrModal"
import StatusModal from "@/components/miscellneous/StatusModal"
import { EditEventDrawer } from "../EditEventDrawer"

interface OverviewTabProps {
    event: Event
    hasEventEnded: boolean
}

export const OverviewTab = ({ event, hasEventEnded }: OverviewTabProps) => {
    const { toggleAllowCheckin, isToggling } = useToggleAllowCheckin()
    const [isCreateNFTModalOpen, setIsCreateNFTModalOpen] = useState({
        open: false,
        section: "create" as "create" | "edit"
    })
    const [isGeneratedQrModalOpen, setIsGeneratedQrModalOpen] = useState(false)
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
    const [actionEffect, setActionEffect] = useState({
        open: false,
        type: "success" as "success" | "error",
        title: "",
        description: "",
    })

    return (
        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Quick Actions */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-xl font-bold text-white mb-2">Quick Actions</h3>

                    {/* Edit Event Card */}
                    <div className="group bg-linear-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl p-6 hover:border-blue-400/30 transition-all duration-300">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                                <Edit className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-semibold text-white mb-1">Edit Event Details</h4>
                                <p className="text-sm text-white/60 mb-4 leading-relaxed">
                                    Update your event information, description, location, date and other details
                                </p>
                                <Button
                                    className="bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-400/40 rounded-xl px-4 h-9 text-sm font-medium transition-all"
                                    disabled={hasEventEnded}
                                    onClick={() => setIsEditDrawerOpen(true)}
                                >
                                    {hasEventEnded ? "Event Ended" : "Edit Event"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Attendance NFT Card */}
                    <div className="group bg-linear-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl p-6 hover:border-purple-400/30 transition-all duration-300">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                                <ImageIcon className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="flex-1">
                                {event.nft_config?.enabled ? (
                                    <>
                                        <h4 className="text-lg font-semibold text-white mb-1">Update Attendance NFT</h4>
                                        <p className="text-sm text-white/60 mb-4 leading-relaxed">
                                            Modify the NFT design, name, or description that attendees will receive
                                        </p>
                                        <Button
                                            className="bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-400/40 rounded-xl px-4 h-9 text-sm font-medium transition-all"
                                            onClick={() => setIsCreateNFTModalOpen({ open: true, section: "edit" })}
                                        >
                                            Update NFT
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <h4 className="text-lg font-semibold text-white mb-1">Setup Attendance NFT</h4>
                                        <p className="text-sm text-white/60 mb-4 leading-relaxed">
                                            Create a commemorative NFT that attendees will receive after checking in
                                        </p>
                                        <Button
                                            className="bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-400/40 rounded-xl px-4 h-9 text-sm font-medium transition-all"
                                            onClick={() => setIsCreateNFTModalOpen({ open: true, section: "create" })}
                                        >
                                            Create NFT
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* QR Code Card */}
                    <div className="group bg-linear-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl p-6 hover:border-yellow-400/30 transition-all duration-300">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 group-hover:bg-yellow-500/20 transition-colors">
                                <QrCode className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-semibold text-white mb-1">Check-in QR Code</h4>
                                <p className="text-sm text-white/60 mb-4 leading-relaxed">
                                    Generate and display QR code for attendees to scan and check into the event
                                </p>
                                <Button
                                    className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 hover:border-yellow-400/40 rounded-xl px-4 h-9 text-sm font-medium transition-all"
                                    onClick={() => setIsGeneratedQrModalOpen(true)}
                                >
                                    Generate QR
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Check-in Toggle Card */}
                    <div className={`group bg-linear-to-br from-white/5 to-white/2 border rounded-2xl p-6 transition-all duration-300 ${event.allowCheckin
                        ? "border-green-500/30 hover:border-green-400/40"
                        : "border-white/10 hover:border-red-400/30"
                        }`}>
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl border transition-colors ${event.allowCheckin
                                ? "bg-green-500/10 border-green-500/20 group-hover:bg-green-500/20"
                                : "bg-white/5 border-white/10 group-hover:bg-red-500/10"
                                }`}>
                                <Power className={`w-5 h-5 ${event.allowCheckin ? "text-green-400" : "text-white/40"}`} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-lg font-semibold text-white">Check-in Control</h4>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${event.allowCheckin
                                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                        : "bg-white/5 text-white/40 border border-white/10"
                                        }`}>
                                        {event.allowCheckin ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <p className="text-sm text-white/60 mb-4 leading-relaxed">
                                    {event.allowCheckin
                                        ? "Check-in is currently enabled. Attendees can scan QR and receive NFTs"
                                        : "Enable check-in to allow attendees to scan QR codes and mark attendance"
                                    }
                                </p>
                                <Button
                                    className={`rounded-xl px-4 h-9 text-sm font-medium transition-all ${event.allowCheckin
                                        ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-400/40"
                                        : "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 hover:border-green-400/40"
                                        } ${isToggling || hasEventEnded ? "opacity-50 cursor-not-allowed" : ""}`}
                                    onClick={async () => {
                                        try {
                                            await toggleAllowCheckin(event.id);
                                            setActionEffect({
                                                open: true,
                                                title: event.allowCheckin
                                                    ? "Check-in Disabled"
                                                    : "Check-in Enabled",
                                                description: event.allowCheckin
                                                    ? "Attendees can no longer check in"
                                                    : "Attendees can now check in to the event",
                                                type: "success",
                                            });
                                        } catch (error) {
                                            console.log(error);
                                            setActionEffect({
                                                open: true,
                                                title: "An error occurred",
                                                description: "Failed to toggle check-in settings",
                                                type: "error",
                                            });
                                        }
                                    }}
                                    disabled={isToggling || hasEventEnded}
                                >
                                    {isToggling
                                        ? "Updating..."
                                        : event.allowCheckin
                                            ? "Disable Check-in"
                                            : "Enable Check-in"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Hosts & Organizers */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-xl font-bold text-white mb-2">Hosts & Co-Organizers</h3>

                    <div className="bg-linear-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl p-6">
                        <div className="flex flex-col gap-4">
                            {event.organizers && event.organizers.length > 0 ? (
                                event.organizers.map((organizer, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4 bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all group"
                                    >
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-linear-to-br from-white/10 to-white/5 border-2 border-white/20 shrink-0">
                                            <Image
                                                src={organizer.avatarUrl}
                                                alt={organizer.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-white font-semibold truncate">{organizer.name}</span>
                                                {index === 0 && (
                                                    <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30 font-semibold whitespace-nowrap">
                                                        Creator
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-white/40 text-xs font-mono truncate block">
                                                {organizer.address.slice(0, 6)}...{organizer.address.slice(-4)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                                        <Edit className="w-8 h-8 text-white/20" />
                                    </div>
                                    <p className="text-white/40 text-sm">No organizers listed</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Optional: Event Stats Card */}
                    <div className="bg-linear-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl p-6">
                        <h4 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Event Stats</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <p className="text-2xl font-bold text-white mb-1">{event.attendeesCount || 0}</p>
                                <p className="text-xs text-white/50">Registered</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <p className="text-2xl font-bold text-white mb-1">{event.checkedInCount || 0}</p>
                                <p className="text-xs text-white/50">Checked In</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateNFTModal
                eventTitle={event.title}
                eventId={event.id}
                onSuccess={() => {
                    setIsCreateNFTModalOpen({ open: false, section: "create" });
                }}
                isOpen={isCreateNFTModalOpen.open}
                setOpen={(val) => setIsCreateNFTModalOpen({ open: val, section: "create" })}
                section={isCreateNFTModalOpen.section}
                initialNFT={
                    isCreateNFTModalOpen.section === "edit" && event.nft_config?.enabled
                        ? {
                            nftName: event.nft_config.nft_name,
                            nftDescription: event.nft_config.nft_description,
                            nftImageUrl: event.nft_config.nft_image_url
                        }
                        : undefined
                }
            />
            <GeneratedQrModal
                title={event.title}
                open={isGeneratedQrModalOpen}
                setOpen={setIsGeneratedQrModalOpen}
                eventId={event.id}
            />
            <StatusModal
                isOpen={actionEffect.open}
                onClose={() => setActionEffect((prev) => ({ ...prev, open: false }))}
                type={actionEffect.type}
                title={actionEffect.title}
                description={actionEffect.description}
            />
            <EditEventDrawer
                isOpen={isEditDrawerOpen}
                setIsOpen={setIsEditDrawerOpen}
                event={event}
                onSuccess={() => {
                    // Optionally trigger a refetch or show success message
                    window.location.reload()
                }}
            />
        </div>
    )
}