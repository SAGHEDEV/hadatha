"use client"

import { Mail } from "lucide-react"

export const GuestsTab = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center p-8 bg-white/5 rounded-3xl border border-white/10">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                <Mail className="w-10 h-10 text-white/40" />
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Guest Invitations</h3>
                <p className="text-white/60 max-w-md mx-auto">
                    We&apos;re working on a feature to let you send personalized invitations directly to your guests via email and wallet address.
                </p>
            </div>
            <div className="px-4 py-2 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-full text-sm font-medium">
                Coming Soon
            </div>
        </div>
    )
}
