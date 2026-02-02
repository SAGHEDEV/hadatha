"use client"

import { useMemo } from "react"
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api"
import { Loader2 } from "lucide-react"

interface EventMapProps {
    lat: number
    lng: number
    className?: string
}

export const EventMap = ({ lat, lng, className }: EventMapProps) => {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    })

    const center = useMemo(() => ({ lat, lng }), [lat, lng])

    if (!isLoaded) {
        return (
            <div className={`w-full bg-white/5 border border-white/10 rounded-xl flex items-center justify-center ${className}`}>
                <Loader2 className="w-6 h-6 animate-spin text-white/40" />
            </div>
        )
    }

    return (
        <div className={`w-full overflow-hidden rounded-xl border border-white/10 ${className}`}>
            <GoogleMap
                zoom={15}
                center={center}
                mapContainerClassName="w-full h-full"
                options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    styles: [
                        {
                            "elementType": "geometry",
                            "stylers": [{ "color": "#242f3e" }]
                        },
                        {
                            "elementType": "labels.text.stroke",
                            "stylers": [{ "color": "#242f3e" }]
                        },
                        {
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#746855" }]
                        },
                    ]
                }}
            >
                <Marker position={center} />
            </GoogleMap>
        </div>
    )
}
