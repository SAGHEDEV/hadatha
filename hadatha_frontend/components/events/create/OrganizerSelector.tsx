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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useGetAllAccounts } from "@/hooks/sui/useGetAccounts"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { useGetDerivedAddress } from "@/hooks/sui/useCheckAccountExistence"

interface OrganizerSelectorProps {
    value: string[]
    onChange: (value: string[]) => void
    disabled?: boolean
}

export function OrganizerSelector({ value = [], onChange, disabled }: OrganizerSelectorProps) {
    const [open, setOpen] = React.useState(false)
    const { accounts, isLoading } = useGetAllAccounts()
    const currentAccount = useCurrentAccount()
    const derivedAddress = useGetDerivedAddress(currentAccount?.address)

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
                        disabled={disabled || isLoading}
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-auto min-h-12 py-2"
                    >
                        <div className="flex flex-wrap gap-1">
                            {value.length > 0 ? (
                                value.map((val) => {
                                    const account = accounts.find((a) => a.address === val)
                                    return (
                                        <Badge key={val} variant="secondary" className="mr-1 bg-white/20 text-white hover:bg-white/30 pl-1 pr-2 py-1 gap-2">
                                            {account && (
                                                <Avatar className="h-5 w-5">
                                                    <AvatarImage src={account.image_url} alt={account.name} />
                                                    <AvatarFallback className="text-[10px]">{account.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <span>{account?.name || val}</span>
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
                                    )
                                })
                            ) : (
                                <span className="text-muted-foreground">
                                    {isLoading ? "Loading organizers..." : "Select organizers..."}
                                </span>
                            )}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-black/90 border-white/10 text-white">
                    <Command className="bg-transparent">
                        <CommandInput placeholder="Search organizer..." className="w-full text-white placeholder:text-white/50" />
                        <CommandList className="w-full">
                            <CommandEmpty className="text-white/60 p-3 text-sm text-center">No user found.</CommandEmpty>
                            <CommandGroup>
                                {accounts.filter((account) => account.id !== derivedAddress).map((account) => (
                                    <CommandItem
                                        key={account.id}
                                        value={account.name} // Search by name
                                        onSelect={() => handleSelect(account.address)} // Select by ID
                                        className="text-white hover:bg-white/10 aria-selected:bg-white/10 cursor-pointer"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value.includes(account.address) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={account.image_url} alt={account.name} />
                                                <AvatarFallback>{account.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span>{account.name}</span>
                                                <span className="text-xs text-white/50">{account.address.slice(0, 6)}...{account.address.slice(-4)}</span>
                                            </div>
                                        </div>
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
