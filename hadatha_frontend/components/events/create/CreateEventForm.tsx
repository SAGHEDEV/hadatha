"use client"

import { useFormContext } from "react-hook-form"
import { CalendarIcon, Upload, Clock } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { OrganizerSelector } from "./OrganizerSelector"
import { CustomFieldsBuilder } from "./CustomFieldsBuilder"
import { TagMultiSelect } from "./TagMultiSelect"
import { TicketTierSelector } from "./TicketTierSelector"
import { LocationPicker } from "./LocationPicker"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20">
            {/* Left Sticky Column */}
            <div className="lg:col-span-6 lg:sticky mt-0 top-24 h-fit space-y-6">
                <h2 className="text-2xl font-bold text-white">Event Details</h2>

                {/* Image Upload */}
                <div className={cn(
                    "relative aspect-square w-full rounded-3xl border-2 border-dashed border-white/20 bg-white/5 overflow-hidden group transition-colors",
                    !isLoading && "hover:border-white/40",
                    isLoading && "opacity-50 cursor-not-allowed"
                )}>
                    {imagePreview ? (
                        <>
                            <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                            {!isLoading && (
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <p className="text-white font-medium">Click to change image</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60 gap-2">
                            <Upload className="w-10 h-10" />
                            <p className="text-center px-4">Click to upload event flyer or backdrop</p>
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

                <FormField
                    control={control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-white">Event Title</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={isLoading}
                                    placeholder="Enter event title"
                                    {...field}
                                    value={field.value ?? ''}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 h-12 text-lg"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Right Scrollable Column */}
            <div className="lg:col-span-6 space-y-8">
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white">Event Configuration</h2>
                    <FormField
                        control={control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-white">Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        disabled={isLoading}
                                        placeholder="Tell us about your event..."
                                        {...field}
                                        value={field.value ?? ''}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 min-h-[150px] resize-y"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Logistics Section */}
                <div className="space-y-6 pt-8 border-t border-white/10">
                    <h2 className="text-2xl font-bold text-white">Logistics</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={control}
                            name="organizer"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Organizers (Co-hosts)</FormLabel>
                                    <FormControl>
                                        <OrganizerSelector value={field.value || []} onChange={field.onChange} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="tags"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Tags</FormLabel>
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

                        <div className="col-span-2">
                            <FormField
                                control={control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white">Location</FormLabel>
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
                        </div>
                    </div>

                    {/* Date and Time - Reorganized */}
                    <div className="space-y-4">
                        {/* Date on its own row */}
                        <FormField
                            control={control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="text-white">Event Date</FormLabel>
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
                                                    // Disable dates before today (start of day)
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

                        {/* Start and End Time on same row */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white">Start Time</FormLabel>
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
                                        <FormLabel className="text-white">End Time</FormLabel>
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
                    </div>
                </div>

                {/* Ticketing Section */}
                <div className="space-y-6 pt-8 border-t border-white/10">
                    <h2 className="text-2xl font-bold text-white">Ticketing</h2>

                    <FormField
                        control={control}
                        name="ticketType"
                        render={({ field }) => (
                            <FormItem className="space-y-4">
                                <FormLabel className="text-sm font-bold text-white/50 uppercase tracking-widest">Select Ticket Type</FormLabel>
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
                                                className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-white/10 transition-all cursor-pointer group"
                                            >
                                                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                    <Ticket className="w-7 h-7 text-white/40 peer-data-[state=checked]:group-[]:text-white" />
                                                </div>
                                                <div className="text-center">
                                                    <h4 className="font-bold text-white text-lg">Free Event</h4>
                                                    <p className="text-xs text-white/40 mt-1">Attendees join without any cost</p>
                                                </div>
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
                                                className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-white/10 transition-all cursor-pointer group"
                                            >
                                                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                    <Coins className="w-7 h-7 text-white/40 peer-data-[state=checked]:group-[]:text-white" />
                                                </div>
                                                <div className="text-center">
                                                    <h4 className="font-bold text-white text-lg">Paid Event</h4>
                                                    <p className="text-xs text-white/40 mt-1">Requires registration fee in SUI or USDC</p>
                                                </div>
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
                                <FormLabel className="text-white">Maximum Attendees (Total)</FormLabel>
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
                                    <p className="text-xs text-white/40 mt-1">Automatically calculated from ticket tiers</p>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Registration Section */}
                <div className="space-y-6 pt-8 border-t border-white/10">
                    <h2 className="text-2xl font-bold text-white">Registration Details</h2>
                    <p className="text-white/60 text-sm">Customize the information you want to collect from attendees.</p>

                    <CustomFieldsBuilder disabled={isLoading} />
                </div>
            </div>
        </div>
    )
}