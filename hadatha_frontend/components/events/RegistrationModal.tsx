"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Event, TicketTier } from "@/types"
import ModalWrapper from "@/components/miscellneous/ModalWrapper"
import { useRegisterUser } from "@/hooks/sui/useRegisterUser"
import { useGetDerivedAddress } from "@/hooks/sui/useCheckAccountExistence"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import StatusModal from "../miscellneous/StatusModal"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useWalletBalances } from "@/hooks/sui/useWalletBalances"
import { SUI_TYPE, USDC_TYPE } from "@/lib/constant"
import { getCurrencyLabel, getFullCurrencyType, formatAmount } from "@/lib/coin"

interface RegistrationModalProps {
    event: Event
    isOpen: boolean
    setIsOpen: (open: boolean) => void
}

export function RegistrationModal({ event, isOpen, setIsOpen }: RegistrationModalProps) {
    const { registerUser, isRegistering } = useRegisterUser();
    const currentAccount = useCurrentAccount();
    const derivedAddress = useGetDerivedAddress(currentAccount?.address);
    const [openEffectModal, setOpenEffectModal] = useState({ open: false, title: "", message: "", type: "success" as "success" | "error" })
    const [selectedTier, setSelectedTier] = useState<TicketTier | null>(() => {
        if (event.ticket_tiers && event.ticket_tiers.length === 1) {
            return event.ticket_tiers[0]
        }
        return null
    })

    const { balances, formattedBalances } = useWalletBalances();

    const isInsufficientBalance = selectedTier && Number(selectedTier.price) > 0 && (
        (getFullCurrencyType(selectedTier.currency || "SUI") === USDC_TYPE && balances.usdc < BigInt(selectedTier.price)) ||
        (getFullCurrencyType(selectedTier.currency || "SUI") === SUI_TYPE && balances.sui < BigInt(selectedTier.price))
    );

    // Dynamically generate schema based on event.registration_fields
    const generateSchema = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const schemaShape: any = {}

        event.registration_fields?.forEach((field) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let validator: any = z.string()

            if (field.type === 'number') {
                validator = z.string().refine((val) => !isNaN(Number(val)), {
                    message: "Must be a number",
                })
            } else if (field.type === 'email') {
                validator = z.string().email("Invalid email address")
            }

            // Make it required by default
            validator = validator.min(1, `${field.name} is required`)

            schemaShape[field.name] = validator
        })

        return z.object(schemaShape)
    }

    const schema = generateSchema()
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(schema),
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onSubmit = async (data: any) => {

        if (!currentAccount) {
            setOpenEffectModal({ open: true, title: "Please connect your wallet first.", message: "", type: "error" })
            return;
        }

        try {
            // Convert form data to array of strings in the order of registration_fields
            // The contract expects vector<vector<u8>>, so we need to convert strings to byte arrays
            const registrationValues = event.registration_fields?.map(field => {
                const value = data[field.name] || "";
                return value.toString(); // Convert to string
            }) || [];

            console.log('Submitting registration with values:', registrationValues);
            console.log('Event ID:', event.id);
            console.log('Account ID:', derivedAddress);

            await registerUser({
                event: event.id,
                account: derivedAddress || null,
                registrationValues: registrationValues,
                tierIndex: selectedTier ? event.ticket_tiers?.findIndex(t => t.name === selectedTier.name) ?? 0 : 0,
                price: selectedTier ? Number(selectedTier.price) : 0,
                currency: selectedTier ? getFullCurrencyType(selectedTier.currency || SUI_TYPE) : SUI_TYPE
            });

            setOpenEffectModal({ open: true, title: "Successfully registered for the event!", message: "", type: "success" })
            reset(); // Reset form after successful registration
            setIsOpen(false);
        } catch (error) {
            console.error("Registration failed:", error);

            // Parse error message for better user feedback
            let errorMessage = "Failed to register. Please try again.";

            if (error instanceof Error) {
                if (error.message.includes('EAlreadyRegistered')) {
                    errorMessage = "You are already registered for this event.";
                } else if (error.message.includes('EEventFull')) {
                    errorMessage = "This event is full. No more spots available.";
                } else if (error.message.includes('EEventClosed')) {
                    errorMessage = "Registration for this event is closed.";
                }
            }

            setOpenEffectModal({ open: true, title: "Failed to register. Please try again.", message: errorMessage, type: "error" })
        }
    }

    console.log(event.registration_fields)

    return (
        <ModalWrapper open={isOpen} setOpen={setIsOpen}>
            <div className="w-full max-w-[500px] text-white p-4">
                <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
                    <h2 className="text-2xl font-bold">Register for {event.title}</h2>
                    <p className="text-white/60 text-sm">
                        Please fill out the following information to complete your registration.
                    </p>
                </div>

                {event.ticket_tiers && event.ticket_tiers.length > 1 && (
                    <div className="mb-6 space-y-3">
                        <Label className="text-white">Select Ticket Tier</Label>
                        <RadioGroup
                            onValueChange={(val) => {
                                const tier = event.ticket_tiers?.find(t => t.name === val) || null
                                setSelectedTier(tier)
                            }}
                            className="flex flex-col space-y-2"
                        >
                            {event.ticket_tiers.map((tier, index) => (
                                <div key={index} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedTier?.name === tier.name ? "bg-white/10 border-white" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem value={tier.name} id={tier.name} className="border-white text-white" />
                                        <Label htmlFor={tier.name} className="flex flex-col cursor-pointer">
                                            <span className="font-medium text-white">{tier.name}</span>
                                            <span className="text-xs text-white/50">{tier.quantity} available</span>
                                        </Label>
                                    </div>
                                    <div className="w-full max-w-fit text-amber-400 font-mono font-medium">
                                        {Number(tier.price) === 0 ? "Free" : `${formatAmount(tier.price)} ${getCurrencyLabel(tier.currency || "SUI")}`}
                                    </div>
                                </div>
                            ))}
                        </RadioGroup>
                        <div className="flex gap-4 mt-2 px-1">
                            <div className="text-[10px] text-white/40 uppercase tracking-wider">Your Balance:</div>
                            <div className="text-[10px] text-white/60 font-mono">SUI: {formattedBalances.sui}</div>
                            <div className="text-[10px] text-white/60 font-mono">USDC: {formattedBalances.usdc}</div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {!event.registration_fields || event.registration_fields.length === 0 ? (
                        <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-center">
                            <p className="text-white/60">No registration fields required. Click register to continue.</p>
                        </div>
                    ) : (
                        event.registration_fields.map((field, index) => (
                            <div key={index} className="space-y-2">
                                <Label className="text-white">
                                    {field.name}
                                    <span className="text-red-400 ml-1">*</span>
                                </Label>

                                {field.type === 'text' || field.type === 'email' || field.type === 'number' ? (
                                    <Input
                                        {...register(field.name)}
                                        type={field.type === 'number' ? 'text' : field.type}
                                        placeholder={`Enter your ${field.name.toLowerCase()}`}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 h-12"
                                    />
                                ) : field.type === 'textarea' ? (
                                    <Textarea
                                        {...register(field.name)}
                                        placeholder={`Enter your ${field.name.toLowerCase()}`}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 min-h-[100px]"
                                    />
                                ) : null}

                                {errors[field.name] && (
                                    <p className="text-red-400 text-sm flex items-center gap-1">
                                        <span className="text-lg">⚠</span>
                                        {errors[field.name]?.message as string}
                                    </p>
                                )}
                            </div>
                        ))
                    )}

                    {/* Event Details Summary */}
                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2">
                        <p className="text-white/60 text-sm">Registration Summary</p>
                        <div className="flex justify-between text-sm">
                            <span className="text-white/60">Event:</span>
                            <span className="text-white font-medium">{event.title}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-white/60">Price:</span>
                            <span className="text-white font-medium">
                                {selectedTier
                                    ? (Number(selectedTier.price) === 0 ? "Free" : `${formatAmount(selectedTier.price)} ${getCurrencyLabel(selectedTier.currency || "SUI")}`)
                                    : (event.price === '0' ? 'Free' : event.price || 'Free')
                                }
                            </span>
                        </div>
                        {isInsufficientBalance && (
                            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-md">
                                <p className="text-red-400 text-xs font-medium flex items-center gap-1">
                                    <span>⚠</span> Insufficient {getCurrencyLabel(selectedTier?.currency || "")} balance
                                </p>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-white/60">Available Spots:</span>
                            <span className="text-white font-medium">
                                {selectedTier
                                    ? (selectedTier.quantity || 0)
                                    : (event.maxAttendees || 0) - (event.attendeesCount || 0)
                                }
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                reset();
                                setIsOpen(false);
                            }}
                            disabled={isRegistering}
                            className="text-white py-6 hover:bg-white/10 border border-white/20 hover:text-white rounded-full cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isRegistering || isInsufficientBalance || !selectedTier}
                            className="bg-white text-black hover:bg-gray-200 px-6 py-6 cursor-pointer rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isRegistering ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Registering...
                                </>
                            ) : (
                                selectedTier ? `Register as ${selectedTier.name}` : "Complete Registration"
                            )}
                        </Button>
                    </div>
                </form>
                <StatusModal isOpen={openEffectModal.open} onClose={() => setOpenEffectModal({ open: false, title: '', message: '', type: 'success' })} title={openEffectModal.title} description={openEffectModal.message} type={openEffectModal.type} />
            </div>
        </ModalWrapper>
    )
}