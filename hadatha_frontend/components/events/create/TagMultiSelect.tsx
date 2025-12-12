"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

const AVAILABLE_TAGS = [
    "Technology",
    "Music",
    "Workshop",
    "Conference",
    "Networking",
    "Education",
    "Sports",
    "Arts",
    "Business",
    "Health",
    "Food & Drink",
    "Entertainment",
    "Community",
    "Charity",
    "Gaming",
    "Fashion",
    "Science",
    "Travel",
    "Fitness",
    "Photography"
]

interface TagMultiSelectProps {
    value: string[]
    onChange: (value: string[]) => void
    disabled?: boolean
}

export function TagMultiSelect({ value = [], onChange, disabled }: TagMultiSelectProps) {
    const [open, setOpen] = React.useState(false)

    const handleToggleTag = (tag: string) => {
        const newValue = value.includes(tag)
            ? value.filter((t) => t !== tag)
            : [...value, tag]
        onChange(newValue)
    }

    const handleRemoveTag = (tag: string, e: React.MouseEvent) => {
        e.stopPropagation()
        onChange(value.filter((t) => t !== tag))
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-auto min-h-[48px] py-2",
                        value.length === 0 && "text-white/40"
                    )}
                >
                    <div className="flex flex-wrap gap-1.5 flex-1">
                        {value.length === 0 ? (
                            <span>Select tags...</span>
                        ) : (
                            value.map((tag) => (
                                <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={(e) => handleRemoveTag(tag, e)}
                                        className="ml-1 hover:text-white/70"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0 bg-black border-white/10" align="start">
                <div className="max-h-[300px] overflow-y-auto p-2">
                    <div className="grid grid-cols-2 gap-1">
                        {AVAILABLE_TAGS.map((tag) => {
                            const isSelected = value.includes(tag)
                            return (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleToggleTag(tag)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left",
                                        isSelected
                                            ? "bg-white/20 text-white"
                                            : "text-white/70 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "h-4 w-4 rounded border flex items-center justify-center shrink-0",
                                            isSelected
                                                ? "bg-white border-white"
                                                : "border-white/30"
                                        )}
                                    >
                                        {isSelected && <Check className="h-3 w-3 text-black" />}
                                    </div>
                                    <span className="truncate">{tag}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
