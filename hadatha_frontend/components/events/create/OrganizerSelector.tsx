"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

const organizers = [
    {
        value: "abdul",
        label: "Abdul",
    },
    {
        value: "john_doe",
        label: "John Doe",
    },
    {
        value: "jane_smith",
        label: "Jane Smith",
    },
    {
        value: "alice_wonder",
        label: "Alice Wonder",
    },
    {
        value: "bob_builder",
        label: "Bob Builder",
    },
]

interface OrganizerSelectorProps {
    value: string[]
    onChange: (value: string[]) => void
}

export function OrganizerSelector({ value = [], onChange }: OrganizerSelectorProps) {
    const [open, setOpen] = React.useState(false)

    const handleSelect = (currentValue: string) => {
        const newValue = value.includes(currentValue)
            ? value.filter((v) => v !== currentValue)
            : [...value, currentValue]
        onChange(newValue)
    }

    const handleRemove = (valToRemove: string) => {
        onChange(value.filter((v) => v !== valToRemove))
    }

    return (
        <div className="flex flex-col gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-auto min-h-12 py-2"
                    >
                        <div className="flex flex-wrap gap-1">
                            {value.length > 0 ? (
                                value.map((val) => (
                                    <Badge key={val} variant="secondary" className="mr-1 bg-white/20 text-white hover:bg-white/30">
                                        {organizers.find((organizer) => organizer.value === val)?.label}
                                        <div
                                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleRemove(val)
                                            }}
                                        >
                                            <X className="h-3 w-3 text-white/70 hover:text-white" />
                                        </div>
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-muted-foreground">Select organizers...</span>
                            )}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-black/90 border-white/10 text-white">
                    <Command className="bg-transparent">
                        <CommandInput placeholder="Search organizer..." className="text-white placeholder:text-white/50" />
                        <CommandList>
                            <CommandEmpty>No organizer found.</CommandEmpty>
                            <CommandGroup>
                                {organizers.map((organizer) => (
                                    <CommandItem
                                        key={organizer.value}
                                        value={organizer.value}
                                        onSelect={() => handleSelect(organizer.value)}
                                        className="text-white hover:bg-white/10 aria-selected:bg-white/10"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value.includes(organizer.value) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {organizer.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
