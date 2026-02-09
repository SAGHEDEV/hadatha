"use client"

import { Button } from "@/components/ui/button"
import { Event } from "@/types"
import { Edit, Image as ImageIcon, QrCode } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useToggleAllowCheckin } from "@/hooks/sui/useCheckin"
import { useState } from "react"
import { CreateNFTModal } from "../CreateNFTModal"
import GeneratedQrModal from "../GeneratedQrModal"
import StatusModal from "@/components/miscellneous/StatusModal"

interface OverviewTabProps {
    event: Event
    hasEventEnded: boolean
}

export const OverviewTab = ({ event, hasEventEnded }: OverviewTabProps) => {
    const router = useRouter()
    const { toggleAllowCheckin, isToggling } = useToggleAllowCheckin()
    const [isCreateNFTModalOpen, setIsCreateNFTModalOpen] = useState({
        open: false,
        section: "create" as "create" | "edit"
    })
    const [isGeneratedQrModalOpen, setIsGeneratedQrModalOpen] = useState(false)
    const [actionEffect, setActionEffect] = useState({
        open: false,
        type: "success" as "success" | "error",
        title: "",
        description: "",
    })

    return (
        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Event Actions */}
                <div className="flex flex-col gap-6 p-6 rounded-3xl bg-white/5 border border-white/10">
                    <h3 className="text-xl font-bold text-white pb-4 border-b border-white/20">Quick Actions</h3>

                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-white/60">Manage your event</p>
                        </div>
                        <Button
                            className="w-full rounded-xl py-6 text-base font-medium bg-white/10 text-white border border-white/10 hover:bg-white/20 hover:border-white/30 transition-all cursor-pointer justify-start px-4"
                            disabled={hasEventEnded}
                            onClick={() => router.push(`/events/${event.id}/edit`)}
                        >
                            <Edit className="w-4 h-4 mr-3 text-blue-400" />
                            Edit Event Details
                        </Button>

                        {event.nft_config?.enabled ? (
                            <Button
                                className="w-full rounded-xl py-6 text-base font-medium bg-white/10 text-white border border-white/10 hover:bg-white/20 hover:border-white/30 transition-all cursor-pointer justify-start px-4"
                                onClick={() => setIsCreateNFTModalOpen({ open: true, section: "edit" })}
                            >
                                <ImageIcon className="w-4 h-4 mr-3 text-purple-400" />
                                Update Attendance NFT
                            </Button>
                        ) : (
                            <Button
                                className="w-full rounded-xl py-6 text-base font-medium bg-white/10 text-white border border-white/10 hover:bg-white/20 hover:border-white/30 transition-all cursor-pointer justify-start px-4"
                                onClick={() => setIsCreateNFTModalOpen({ open: true, section: "create" })}
                            >
                                <ImageIcon className="w-4 h-4 mr-3 text-purple-400" />
                                Setup Attendance NFT
                            </Button>
                        )}

                        <Button
                            className="w-full rounded-xl py-6 text-base font-medium bg-white/10 text-white border border-white/10 hover:bg-white/20 hover:border-white/30 transition-all cursor-pointer justify-start px-4"
                            onClick={() => setIsGeneratedQrModalOpen(true)}
                        >
                            <QrCode className="w-4 h-4 mr-3 text-yellow-400" />
                            Check-in QR Code
                        </Button>


                        <div className="pt-4 border-t border-white/10">
                            <p className="text-sm text-white/60 mb-3">Check-in Status</p>
                            <Button
                                className={`w-full py-6 text-base font-medium text-center rounded-full ${event.allowCheckin
                                    ? "bg-red-600 text-white hover:bg-red-400"
                                    : "bg-green-600 text-white hover:bg-green-400"
                                    } transition-all cursor-pointer justify-center px-4 ${isToggling ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
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

                {/* Hosts & Organizers */}
                <div className="flex flex-col gap-6 p-6 rounded-3xl bg-white/5 border border-white/10 h-fit">
                    <h3 className="text-xl font-bold text-white pb-4 border-b border-white/20">Hosts & Co-Organizers</h3>

                    <div className="flex flex-col gap-4">
                        {event.organizers && event.organizers.length > 0 ? (
                            event.organizers.map((organizer, index) => (
                                <div key={index} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-black border border-white/20">
                                        <Image
                                            src={organizer.avatarUrl}
                                            alt={organizer.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white font-medium">{organizer.name}</span>
                                        <span className="text-white/40 text-xs truncate max-w-[200px]">{organizer.address}</span>
                                    </div>
                                    {index === 0 && (
                                        <span className="ml-auto text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30">
                                            Creator
                                        </span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <span className="text-white/40 italic">No organizers listed</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateNFTModal
                eventTitle={event.title}
                eventId={event.id}
                onSuccess={() => {
                    setIsCreateNFTModalOpen({ open: false, section: "create" });
                    // Optionally refresh event data here - parent will likely handle this via SWR revalidation
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
        </div>
    )
}
