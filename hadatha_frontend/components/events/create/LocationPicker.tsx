"use client"

import { Input } from "@/components/ui/input"
import { MapPin } from "lucide-react"

interface LocationPickerProps {
    value?: string
    onLocationSelect: (address: string, lat?: number, lng?: number) => void
    disabled?: boolean
    className?: string
}

export const LocationPicker = ({ value, onLocationSelect, disabled, className }: LocationPickerProps) => {

    // Google Maps integration deferred. 
    // This component now behaves as a simple wrapper around a text input.

    return (
        <div className={`w-full space-y-4 ${className}`}>
            <div className="w-full relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <Input
                    value={value || ""}
                    onChange={(e) => onLocationSelect(e.target.value)} // Latitude/Longitude undefined
                    disabled={disabled}
                    placeholder="Event location (e.g. Dubai Mall)"
                    className=" w-full bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 h-12 pl-8"
                />
            </div>
            {/* Map view removed for now */}
        </div>
    )
}
