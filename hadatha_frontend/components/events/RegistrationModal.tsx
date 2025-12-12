"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Event } from "@/types"
import ModalWrapper from "@/components/miscellneous/ModalWrapper"
import { useRegisterUser } from "@/hooks/sui/useRegisterUser"
import { useGetDerivedAddress } from "@/hooks/sui/useCheckAccountExistence"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import StatusModal from "../miscellneous/StatusModal"

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
        if (!derivedAddress) {
            setOpenEffectModal({ open: true, title: "Account not found. Please create an account first.", message: "", type: "error" })
            return;
        }

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
                account: derivedAddress,
                registrationValues: registrationValues
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
                            <span className="text-white font-medium">{event.price || 'Free'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-white/60">Available Spots:</span>
                            <span className="text-white font-medium">
                                {(event.maxAttendees || 0) - (event.attendeesCount || 0)}
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
                            disabled={isRegistering}
                            className="bg-white text-black hover:bg-gray-200 px-6 py-6 cursor-pointer rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isRegistering ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Registering...
                                </>
                            ) : (
                                "Complete Registration"
                            )}
                        </Button>
                    </div>
                </form>
                <StatusModal isOpen={openEffectModal.open} onClose={() => setOpenEffectModal({ open: false, title: '', message: '', type: 'success' })} title={openEffectModal.title} description={openEffectModal.message} type={openEffectModal.type} />
            </div>
        </ModalWrapper>
    )
}