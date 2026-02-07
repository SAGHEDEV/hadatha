"use client"

import { useState } from "react"
import ModalWrapper from "./ModalWrapper"
import { Button } from "../ui/button"
import { Check, Copy, Facebook, Linkedin, Mail, Twitter } from "lucide-react"
import { Event } from "@/types"

interface ShareModalProps {
    open: boolean
    setOpen: (open: boolean) => void
    event: Event
}

const ShareModal = ({ open, setOpen, event }: ShareModalProps) => {
    const [copied, setCopied] = useState(false)

    // Generate the event URL (use readable hex if available)
    const eventUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/events/${event.event_hex || event.id}`
        : `https://hadatha.app/events/${event.event_hex || event.id}`

    const shareText = `Check out ${event.title} on Hadatha!`
    const encodedUrl = encodeURIComponent(eventUrl)
    const encodedText = encodeURIComponent(shareText)

    // Social media share URLs
    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        email: `mailto:?subject=${encodeURIComponent(event.title)}&body=${encodedText}%0A%0A${encodedUrl}`,
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(eventUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const handleShare = (platform: keyof typeof shareLinks) => {
        window.open(shareLinks[platform], '_blank', 'width=600,height=400')
    }

    return (
        <ModalWrapper open={open} setOpen={setOpen}>
            <div className="w-full max-w-[500px] text-white p-6">
                {/* Header */}
                <div className="flex flex-col space-y-2 mb-6">
                    <h2 className="text-2xl font-bold">Share Event</h2>
                    <p className="text-white/60 text-sm">
                        Share this event with your friends and community
                    </p>
                </div>

                {/* Event Preview Card */}
                <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
                    <h3 className="font-semibold text-lg line-clamp-2">{event.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                        <span>{event.location}</span>
                        <span>•</span>
                        <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>

                {/* Copy Link Section */}
                <div className="mb-6">
                    <label className="text-sm text-white/70 mb-2 block">Event Link</label>
                    <div className="flex gap-2">
                        <div className="h-[45px] flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm truncate">
                            {eventUrl}
                        </div>
                        <Button
                            onClick={handleCopyLink}
                            className="h-[45px] px-4 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all"
                        >
                            {copied ? (
                                <Check className="w-5 h-5 text-green-400" />
                            ) : (
                                <Copy className="w-5 h-5" />
                            )}
                        </Button>
                    </div>
                    {copied && (
                        <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Link copied to clipboard!
                        </p>
                    )}
                </div>

                {/* Social Share Buttons */}
                <div className="mb-6">
                    <label className="text-sm text-white/70 mb-3 block">Share on Social Media</label>
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            onClick={() => handleShare('twitter')}
                            className="w-full rounded-xl py-6 bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-3 cursor-pointer"
                        >
                            <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                            <span>Twitter</span>
                        </Button>
                        <Button
                            onClick={() => handleShare('facebook')}
                            className="w-full rounded-xl py-6 bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-3 cursor-pointer"
                        >
                            <Facebook className="w-5 h-5 text-[#1877F2]" />
                            <span>Facebook</span>
                        </Button>
                        <Button
                            onClick={() => handleShare('linkedin')}
                            className="w-full rounded-xl py-6 bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-3 cursor-pointer"
                        >
                            <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                            <span>LinkedIn</span>
                        </Button>
                        <Button
                            onClick={() => handleShare('email')}
                            className="w-full rounded-xl py-6 bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-3 cursor-pointer"
                        >
                            <Mail className="w-5 h-5 text-white/80" />
                            <span>Email</span>
                        </Button>
                    </div>
                </div>

                {/* Close Button */}
                <Button
                    onClick={() => setOpen(false)}
                    className="w-full rounded-full py-6 bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all cursor-pointer"
                >
                    Close
                </Button>
            </div>
        </ModalWrapper>
    )
}

export default ShareModal
