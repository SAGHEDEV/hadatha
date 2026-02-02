"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"

export interface TicketTier {
    name: string
    price: string
    currency: "SUI" | "USDT"
}

interface TicketTierSelectorProps {
    value: TicketTier[]
    onChange: (tiers: TicketTier[]) => void
    disabled?: boolean
}

export const TicketTierSelector = ({ value = [], onChange, disabled }: TicketTierSelectorProps) => {

    const addTier = () => {
        const newTiers = [...value, { name: "", price: "", currency: "SUI" as const }]
        onChange(newTiers)
    }

    const removeTier = (index: number) => {
        const newTiers = value.filter((_, i) => i !== index)
        onChange(newTiers)
    }

    const updateTier = (index: number, field: keyof TicketTier, fieldVal: string) => {
        const newTiers = value.map((tier, i) => {
            if (i === index) {
                return { ...tier, [field]: fieldVal }
            }
            return tier
        })
        onChange(newTiers)
    }

    return (
        <div className="space-y-4">
            {value.map((tier, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-end p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-full md:w-1/3 space-y-2">
                        <Label className="text-xs text-white/60">Tier Name</Label>
                        <Input
                            placeholder="e.g. VIP, Regular"
                            value={tier.name}
                            onChange={(e) => updateTier(index, "name", e.target.value)}
                            disabled={disabled}
                            className="bg-black/20 border-white/10 text-white placeholder:text-white/30 h-10"
                        />
                    </div>

                    <div className="w-full md:w-1/3 space-y-2">
                        <Label className="text-xs text-white/60">Price</Label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={tier.price}
                            onChange={(e) => updateTier(index, "price", e.target.value)}
                            disabled={disabled}
                            className="bg-black/20 border-white/10 text-white placeholder:text-white/30 h-10"
                        />
                    </div>

                    <div className="w-full md:w-1/4 space-y-2">
                        <Label className="text-xs text-white/60">Currency</Label>
                        <Select
                            value={tier.currency}
                            onValueChange={(val: "SUI" | "USDT") => updateTier(index, "currency", val)}
                            disabled={disabled}
                        >
                            <SelectTrigger className="bg-black/20 border-white/10 text-white h-10">
                                <SelectValue placeholder="Currency" />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-white/10 text-white">
                                <SelectItem value="SUI">SUI</SelectItem>
                                <SelectItem value="USDT">USDT</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTier(index)}
                        disabled={disabled}
                        className="text-white/40 hover:text-red-400 hover:bg-white/5 mb-[2px]"
                    >
                        <Trash2 className="w-5 h-5" />
                    </Button>
                </div>
            ))}

            <Button
                type="button"
                variant="outline"
                onClick={addTier}
                disabled={disabled}
                className="w-full border-dashed border-white/20 text-white/60 hover:text-white hover:bg-white/5 hover:border-white/40 h-12"
            >
                <Plus className="w-4 h-4 mr-2" />
                Add Ticket Tier
            </Button>
        </div>
    )
}
