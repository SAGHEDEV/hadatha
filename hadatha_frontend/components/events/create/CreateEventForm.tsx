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
import { useState } from "react"
import Image from "next/image"

export function CreateEventForm({ isLoading }: { isLoading: boolean }) {
    const { control, setValue, watch } = useFormContext()
    const [imagePreview, setImagePreview] = useState<string | null>(watch("imagePreviewUrl") ?? (typeof watch("image") === "string" ? watch("image") : null))


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setImagePreview(url)
            setValue("image", file) // In a real app, this would be the file or uploaded URL
            setValue("imagePreviewUrl", url)
        }
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-20">
            {/* Event Details Section */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Event Details</h2>

                {/* Image Upload */}
                <div className={cn(
                    "relative h-64 w-full rounded-3xl border-2 border-dashed border-white/20 bg-white/5 overflow-hidden group transition-colors",
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
                            <p>Click to upload event flyer or backdrop</p>
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
                                <Input disabled={isLoading} placeholder="Enter event title" {...field} value={field.value ?? ''} className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 h-12 text-lg" />
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel className="text-white">Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                disabled={isLoading}
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-12",
                                                    !field.value && "text-muted-foreground"
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
                                            // disabled={(date) =>
                                            //     date < new Date()
                                            // }
                                            initialFocus
                                            className="text-white bg-black!"
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
                                <FormLabel className="text-white">Start Time</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                                        <Input disabled={isLoading} type="time" {...field} value={field.value ?? ''} className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 block h-12" />
                                    </div>
                                </FormControl>
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
                                <FormControl>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                                        <Input disabled={isLoading} type="time" {...field} value={field.value ?? ''} className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 block h-12" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            {/* Ticketing Section */}
            <div className="space-y-6 pt-8 border-t border-white/10">
                <h2 className="text-2xl font-bold text-white">Ticketing</h2>

                <FormField
                    control={control}
                    name="ticketType"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className="text-white">Ticket Type</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                    disabled={isLoading}
                                >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="free" className="border-white text-white" />
                                        </FormControl>
                                        <FormLabel className="font-normal text-white">
                                            Free Event
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="paid" className="border-white text-white" />
                                        </FormControl>
                                        <FormLabel className="font-normal text-white">
                                            Paid Event
                                        </FormLabel>
                                    </FormItem>
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
                                    disabled={isLoading}
                                    type="number"
                                    placeholder="e.g., 100"
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 h-12"
                                />
                            </FormControl>
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
    )
}
