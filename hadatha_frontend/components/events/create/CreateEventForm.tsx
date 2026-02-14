"use client"

import { useFormContext } from "react-hook-form"
import { CalendarIcon, Upload, Clock, Monitor, Globe, Lock, MapPin } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Switch from "@/components/ui/Switch"
import { OrganizerSelector } from "./OrganizerSelector"
import { CustomFieldsBuilder } from "./CustomFieldsBuilder"
import { TagMultiSelect } from "./TagMultiSelect"
import { TicketTierSelector } from "./TicketTierSelector"
import { LocationPicker } from "./LocationPicker"
import { RichTextEditor } from "@/components/ui/RichTextEditor"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Ticket, Coins } from "lucide-react"

export function CreateEventForm({ isLoading }: { isLoading: boolean }) {
    const { control, setValue, watch } = useFormContext()
    const [imagePreview, setImagePreview] = useState<string | null>(watch("imagePreviewUrl") ?? (typeof watch("image") === "string" ? watch("image") : null))

    const ticketTiers = watch("ticketTiers")
    const ticketType = watch("ticketType")

    // Update maxAttendees when ticket tiers change for paid events
    useEffect(() => {
        if (ticketType === "paid" && Array.isArray(ticketTiers)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const total = ticketTiers.reduce((acc: number, tier: any) => acc + (tier.quantity || 0), 0)
            if (total > 0) {
                setValue("maxAttendees", total)
            }
        }
    }, [ticketTiers, ticketType, setValue])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setImagePreview(url)
            setValue("image", file)
            setValue("imagePreviewUrl", url)
        }
    }

    // Generate time options in 15-minute intervals
    const generateTimeOptions = () => {
        const options = []
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
                const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                })
                options.push({ value: timeString, label: displayTime })
            }
        }
        return options
    }

    const timeOptions = generateTimeOptions()

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            {/* Header Section */}
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">Create New Event</h2>
                <p className="text-white/60">Fill in the details below to create your event</p>
            </div>

            {/* Basic Information Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2">
                    <div className="h-px flex-1 bg-linear-to-r from-white/0 via-white/20 to-white/0" />
                    <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                    <div className="h-px flex-1 bg-linear-to-r from-white/0 via-white/20 to-white/0" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Image Upload */}
                    <div className={cn(
                        "relative aspect-video lg:aspect-square w-full rounded-3xl border-2 border-dashed border-white/20 bg-white/5 overflow-hidden group transition-colors",
                        !isLoading && "hover:border-white/40",
                        isLoading && "opacity-50 cursor-not-allowed"
                    )}>
                        {imagePreview ? (
                            <>
                                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                {!isLoading && (
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white font-medium text-sm">Click to change image</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60 gap-2 p-4">
                                <Upload className="w-10 h-10" />
                                <p className="text-center text-sm">Upload event cover image</p>
                                <p className="text-center text-xs text-white/40">Recommended: 1200x630px</p>
                            </div>
                        )}
                        <Input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={handleImageChange}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Title and Description */}
                    <div className="space-y-4">
                        <FormField
                            control={control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Event Title *</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isLoading}
                                            placeholder="e.g., Web3 Conference 2024"
                                            {...field}
                                            value={field.value ?? ''}
                                            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 h-12"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Description *</FormLabel>
                                    <FormControl>
                                        <RichTextEditor
                                            disabled={isLoading}
                                            value={field.value ?? ''}
                                            onChange={field.onChange}
                                            placeholder="Tell attendees what your event is about..."
                                            className="min-h-[390px] max-h-[400px] overflow-auto    "
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Tags and Organizers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={control}
                        name="tags"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-white">Event Tags</FormLabel>
                                <FormControl>
                                    <TagMultiSelect
                                        value={field.value || []}
                                        onChange={field.onChange}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="organizer"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-white">Co-Organizers</FormLabel>
                                <FormControl>
                                    <OrganizerSelector value={field.value || []} onChange={field.onChange} disabled={isLoading} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            {/* Date, Time & Location Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2">
                    <div className="h-px flex-1 bg-linear-to-r from-white/0 via-white/20 to-white/0" />
                    <h3 className="text-lg font-semibold text-white">Date, Time & Location</h3>
                    <div className="h-px flex-1 bg-linear-to-r from-white/0 via-white/20 to-white/0" />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel className="text-white">Event Date *</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                disabled={isLoading}
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-12",
                                                    !field.value && "text-white/40"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-black border-white/10" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => {
                                                const today = new Date()
                                                today.setHours(0, 0, 0, 0)
                                                return date < today
                                            }}
                                            initialFocus
                                            className="text-white bg-black rounded-xl"
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="startTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-white">Start Time *</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                disabled={isLoading}
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-12",
                                                    !field.value && "text-white/40"
                                                )}
                                            >
                                                <Clock className="mr-2 h-4 w-4 opacity-50" />
                                                {field.value ? (
                                                    new Date(`2000-01-01T${field.value}`).toLocaleTimeString('en-US', {
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    })
                                                ) : (
                                                    <span>Select time</span>
                                                )}
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-0 bg-black border-white/10" align="start">
                                        <div className="max-h-64 overflow-y-auto p-2">
                                            {timeOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => field.onChange(option.value)}
                                                    className={cn(
                                                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                                                        field.value === option.value
                                                            ? "bg-white text-black font-medium"
                                                            : "text-white hover:bg-white/10"
                                                    )}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="endTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-white">End Time *</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                disabled={isLoading}
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-12",
                                                    !field.value && "text-white/40"
                                                )}
                                            >
                                                <Clock className="mr-2 h-4 w-4 opacity-50" />
                                                {field.value ? (
                                                    new Date(`2000-01-01T${field.value}`).toLocaleTimeString('en-US', {
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    })
                                                ) : (
                                                    <span>Select time</span>
                                                )}
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-0 bg-black border-white/10" align="start">
                                        <div className="max-h-64 overflow-y-auto p-2">
                                            {timeOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => field.onChange(option.value)}
                                                    className={cn(
                                                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                                                        field.value === option.value
                                                            ? "bg-white text-black font-medium"
                                                            : "text-white hover:bg-white/10"
                                                    )}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Event Type */}
                <FormField
                    control={control}
                    name="eventType"
                    render={({ field }) => (
                        <FormItem className="space-y-4">
                            <FormLabel className="text-white">Event Type *</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={(val) => {
                                        field.onChange(val)
                                        if (val === "virtual") {
                                            setValue("location", "Virtual Event")
                                            setValue("location_lat", undefined)
                                            setValue("location_lng", undefined)
                                        } else {
                                            setValue("location", "")
                                        }
                                    }}
                                    defaultValue={field.value}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                                    disabled={isLoading}
                                >
                                    <div>
                                        <RadioGroupItem
                                            value="physical"
                                            id="physical"
                                            className="peer sr-only"
                                        />
                                        <label
                                            htmlFor="physical"
                                            className="flex items-center gap-4 p-4 rounded-2xl border-2 border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-white/10 transition-all cursor-pointer group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                                <MapPin className="w-5 h-5 text-white/40" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm">Physical Location</h4>
                                                <p className="text-xs text-white/40">In-person at a venue</p>
                                            </div>
                                        </label>
                                    </div>

                                    <div>
                                        <RadioGroupItem
                                            value="virtual"
                                            id="virtual"
                                            className="peer sr-only"
                                        />
                                        <label
                                            htmlFor="virtual"
                                            className="flex items-center gap-4 p-4 rounded-2xl border-2 border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-white/10 transition-all cursor-pointer group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                                <Monitor className="w-5 h-5 text-white/40" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm">Virtual Event</h4>
                                                <p className="text-xs text-white/40">Online via link</p>
                                            </div>
                                        </label>
                                    </div>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Location Details */}
                {watch("eventType") === "physical" ? (
                    <FormField
                        control={control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-white">Venue Address *</FormLabel>
                                <FormControl>
                                    <LocationPicker
                                        value={field.value}
                                        onLocationSelect={(address, lat, lng) => {
                                            field.onChange(address)
                                            setValue("location_lat", lat)
                                            setValue("location_lng", lng)
                                        }}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={control}
                                name="linkType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white">Platform *</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isLoading}
                                        >
                                            <FormControl className="h-12">
                                                <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 w-full">
                                                    <SelectValue placeholder="Select platform" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-black border-white/10 text-white">
                                                <SelectItem value="google_meet">Google Meet</SelectItem>
                                                <SelectItem value="zoom">Zoom</SelectItem>
                                                <SelectItem value="teams">Microsoft Teams</SelectItem>
                                                <SelectItem value="discord">Discord</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name="eventLink"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white">Meeting Link *</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                <Input
                                                    disabled={isLoading}
                                                    placeholder="https://..."
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 h-12 pl-10"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={control}
                            name="isAnonymous"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-white/10 p-4 bg-white/5">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-white flex items-center gap-2">
                                            <Lock className="w-4 h-4" />
                                            Private Link
                                        </FormLabel>
                                        <p className="text-xs text-white/40">
                                            Only registered attendees can see the meeting link
                                        </p>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                )}
            </div>

            {/* Ticketing Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2">
                    <div className="h-px flex-1 bg-linear-to-r from-white/0 via-white/20 to-white/0" />
                    <h3 className="text-lg font-semibold text-white">Ticketing & Capacity</h3>
                    <div className="h-px flex-1 bg-linear-to-r from-white/0 via-white/20 to-white/0" />
                </div>

                <FormField
                    control={control}
                    name="ticketType"
                    render={({ field }) => (
                        <FormItem className="space-y-4">
                            <FormLabel className="text-white">Ticket Type *</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                                    disabled={isLoading}
                                >
                                    <div>
                                        <RadioGroupItem
                                            value="free"
                                            id="free"
                                            className="peer sr-only"
                                        />
                                        <label
                                            htmlFor="free"
                                            className="flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-white/10 transition-all cursor-pointer group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                                <Ticket className="w-6 h-6 text-white/40" />
                                            </div>
                                            <h4 className="font-bold text-white">Free Event</h4>
                                            <p className="text-xs text-white/40 mt-1 text-center">No cost to attend</p>
                                        </label>
                                    </div>

                                    <div>
                                        <RadioGroupItem
                                            value="paid"
                                            id="paid"
                                            className="peer sr-only"
                                        />
                                        <label
                                            htmlFor="paid"
                                            className="flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-white/10 transition-all cursor-pointer group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                                <Coins className="w-6 h-6 text-white/40" />
                                            </div>
                                            <h4 className="font-bold text-white">Paid Event</h4>
                                            <p className="text-xs text-white/40 mt-1 text-center">Requires payment in SUI or USDC</p>
                                        </label>
                                    </div>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {watch("ticketType") === "paid" && (
                    <FormField
                        control={control}
                        name="ticketTiers"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-white">Ticket Tiers</FormLabel>
                                <FormControl>
                                    <TicketTierSelector
                                        value={field.value || []}
                                        onChange={field.onChange}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={control}
                    name="maxAttendees"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-white">Maximum Attendees *</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={isLoading || watch("ticketType") === "paid"}
                                    type="number"
                                    placeholder="e.g., 100"
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 h-12"
                                />
                            </FormControl>
                            {watch("ticketType") === "paid" && (
                                <p className="text-xs text-white/40 mt-1">Auto-calculated from ticket tiers</p>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Registration Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2">
                    <div className="h-px flex-1 bg-linear-to-r from-white/0 via-white/20 to-white/0" />
                    <h3 className="text-lg font-semibold text-white">Registration Information</h3>
                    <div className="h-px flex-1 bg-linear-to-r from-white/0 via-white/20 to-white/0" />
                </div>

                <p className="text-white/60 text-sm">Customize what information you want to collect from attendees during registration.</p>

                <CustomFieldsBuilder disabled={isLoading} />
            </div>
        </div>
    )
}