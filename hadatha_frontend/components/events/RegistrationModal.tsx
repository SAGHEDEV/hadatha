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
import { useGetDerivedAddress, useCheckAccountExistence } from "@/hooks/sui/useCheckAccountExistence"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import StatusModal from "../miscellneous/StatusModal"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useWalletBalances } from "@/hooks/sui/useWalletBalances"
import { SUI_TYPE, USDC_TYPE } from "@/lib/constant"
import { getCurrencyLabel, getFullCurrencyType, formatAmount } from "@/lib/coin"
import { normalizeStructTag } from "@mysten/sui/utils"

interface RegistrationModalProps {
    event: Event
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    onRegisterSuccess?: () => void
}

// Helper to extract meaningful error from MoveAbort
const formatMoveError = (errorMsg: string): string => {
    if (errorMsg.includes("function: 14")) return "You are already registered for this event.";
    if (errorMsg.includes("function: 15")) return "This event is full.";
    if (errorMsg.includes("function: 16")) return "Registration is closed.";
    return "An error occurred during transaction execution.";
};

export function RegistrationModal({ event, isOpen, setIsOpen, onRegisterSuccess }: RegistrationModalProps) {
    const { registerUser, isRegistering } = useRegisterUser();
    const currentAccount = useCurrentAccount();
    const { hasAccount } = useCheckAccountExistence();
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
        (normalizeStructTag(getFullCurrencyType(selectedTier.currency || "SUI")) === normalizeStructTag(USDC_TYPE) && balances.usdc < BigInt(selectedTier.price)) ||
        (normalizeStructTag(getFullCurrencyType(selectedTier.currency || "SUI")) === normalizeStructTag(SUI_TYPE) && balances.sui < BigInt(selectedTier.price))
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
            const registrationValues = event.registration_fields?.map(field => {
                const value = data[field.name] || "";
                return value.toString();
            }) || [];

            await registerUser({
                event: event.id,
                account: hasAccount ? derivedAddress : null,
                registrationValues: registrationValues,
                tierIndex: selectedTier ? event.ticket_tiers?.findIndex(t => t.name === selectedTier.name) ?? 0 : 0,
                price: selectedTier ? Number(selectedTier.price) : 0,
                currency: selectedTier ? getFullCurrencyType(selectedTier.currency || SUI_TYPE) : SUI_TYPE
            });

            setOpenEffectModal({ open: true, title: "Successfully registered for the event!", message: "", type: "success" })
            reset();

            if (onRegisterSuccess) {
                onRegisterSuccess();
            }

            setIsOpen(false);
        } catch (error) {
            console.error("Registration failed:", error);

            let errorMessage = "Failed to register. Please try again.";

            if (error instanceof Error) {
                const errorMessageStr = error.message;

                if (errorMessageStr.includes('EAlreadyRegistered') || errorMessageStr.includes('MoveAbort') && errorMessageStr.includes('function: 14')) {
                    errorMessage = "You are already registered for this event.";
                } else if (errorMessageStr.includes('EEventFull') || errorMessageStr.includes('MoveAbort') && errorMessageStr.includes('function: 15')) {
                    errorMessage = "This event is full. No more spots available.";
                } else if (errorMessageStr.includes('EEventClosed')) {
                    errorMessage = "Registration for this event is closed.";
                } else if (errorMessageStr.includes('MoveAbort')) {
                    errorMessage = `Transaction failed: ${formatMoveError(errorMessageStr)}`;
                }
            }

            setOpenEffectModal({ open: true, title: "Failed to register. Please try again.", message: errorMessage, type: "error" })
        }
    }

    return (
        <ModalWrapper open={isOpen} setOpen={setIsOpen}>
            <div className="w-full max-w-[550px] text-white p-6">
                <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
                    <h2 className="text-2xl font-bold">Register for {event.title}</h2>
                    <p className="text-white/60 text-sm">
                        Please fill out the following information to complete your registration.
                    </p>
                </div>

                {event.ticket_tiers && event.ticket_tiers.length > 1 && (
                    <div className="mb-6 space-y-3">
                        <Label className="text-white font-semibold">Select Ticket Tier</Label>
                        <RadioGroup
                            value={selectedTier?.name || ""}
                            onValueChange={(val) => {
                                const tier = event.ticket_tiers?.find(t => t.name === val) || null
                                setSelectedTier(tier)
                            }}
                            className="flex flex-col space-y-3"
                        >
                            {event.ticket_tiers.map((tier, index) => (
                                <label
                                    key={index}
                                    htmlFor={`tier-${tier.name}`}
                                    className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all group ${selectedTier?.name === tier.name
                                            ? "bg-white/10 border-white shadow-lg scale-[1.02]"
                                            : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20 hover:scale-[1.01]"
                                        }`}
                                >
                                    <div className="flex items-center space-x-4 flex-1">
                                        <RadioGroupItem
                                            value={tier.name}
                                            id={`tier-${tier.name}`}
                                            className="border-white text-white shrink-0"
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-white text-base">{tier.name}</span>
                                            <span className="text-xs text-white/50 mt-0.5">
                                                {tier.quantity} {tier.quantity === 1 ? 'spot' : 'spots'} available
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <div className="text-amber-400 font-mono font-bold text-lg">
                                            {Number(tier.price) === 0 ? "Free" : formatAmount(tier.price)}
                                        </div>
                                        {Number(tier.price) > 0 && (
                                            <div className="text-xs text-amber-300/60 font-medium mt-0.5">
                                                {getCurrencyLabel(tier.currency || "SUI")}
                                            </div>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </RadioGroup>

                        {/* Wallet Balance Display */}
                        <div className="flex items-center gap-6 mt-3 px-2 py-2 bg-white/5 rounded-xl border border-white/10">
                            <div className="text-xs text-white/50 uppercase tracking-wider font-semibold">Your Balance:</div>
                            <div className="flex gap-4">
                                <div className="text-xs text-white/70 font-mono">
                                    <span className="text-white/50">SUI:</span> <span className="font-semibold">{formattedBalances.sui}</span>
                                </div>
                                <div className="text-xs text-white/70 font-mono">
                                    <span className="text-white/50">USDC:</span> <span className="font-semibold">{formattedBalances.usdc}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {!event.registration_fields || event.registration_fields.length === 0 ? (
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                            <p className="text-white/60">No additional information required. Click register to continue.</p>
                        </div>
                    ) : (
                        event.registration_fields.map((field, index) => (
                            <div key={index} className="space-y-2">
                                <Label className="text-white font-medium">
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

                    {/* Registration Summary */}
                    <div className="p-5 bg-linear-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl space-y-3">
                        <p className="text-white/70 text-sm font-semibold uppercase tracking-wider">Registration Summary</p>
                        <div className="flex justify-between text-sm">
                            <span className="text-white/60">Event:</span>
                            <span className="text-white font-semibold">{event.title}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-white/60">Ticket Type:</span>
                            <span className="text-white font-semibold">
                                {selectedTier ? selectedTier.name : "Standard"}
                            </span>
                        </div>
                        <div className="flex justify-between text-base border-t border-white/20 pt-3">
                            <span className="text-white/70 font-semibold">Total Price:</span>
                            <span className="text-amber-400 font-bold font-mono">
                                {selectedTier
                                    ? (Number(selectedTier.price) === 0 ? "Free" : `${formatAmount(selectedTier.price)} ${getCurrencyLabel(selectedTier.currency || "SUI")}`)
                                    : (event.price === '0' ? 'Free' : event.price || 'Free')
                                }
                            </span>
                        </div>
                        {isInsufficientBalance && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                                <p className="text-red-400 text-sm font-semibold flex items-center gap-2">
                                    <span className="text-lg">⚠</span>
                                    Insufficient {getCurrencyLabel(selectedTier?.currency || "")} balance
                                </p>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-white/60">Spots Remaining:</span>
                            <span className="text-white font-semibold">
                                {selectedTier
                                    ? (selectedTier.quantity || 0)
                                    : (event.maxAttendees || 0) - (event.attendeesCount || 0)
                                }
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                reset();
                                setIsOpen(false);
                            }}
                            disabled={isRegistering}
                            className="text-white h-12 hover:bg-white/10 border border-white/20 hover:text-white rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isRegistering || isInsufficientBalance || (event.ticket_tiers && event.ticket_tiers.length > 0 && !selectedTier)}
                            className="bg-white text-black hover:bg-gray-200 px-8 h-12 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isRegistering ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Registering...
                                </>
                            ) : (
                                selectedTier ? `Register - ${selectedTier.name}` : "Complete Registration"
                            )}
                        </Button>
                    </div>
                </form>
                <StatusModal
                    isOpen={openEffectModal.open}
                    onClose={() => setOpenEffectModal({ open: false, title: '', message: '', type: 'success' })}
                    title={openEffectModal.title}
                    description={openEffectModal.message}
                    type={openEffectModal.type}
                />
            </div>
        </ModalWrapper>
    )
}