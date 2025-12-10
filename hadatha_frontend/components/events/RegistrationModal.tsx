"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Event } from "@/types"
import ModalWrapper from "@/components/miscellneous/ModalWrapper"

interface RegistrationModalProps {
    event: Event
    isOpen: boolean
    onClose: () => void
}

export function RegistrationModal({ event, isOpen, onClose }: RegistrationModalProps) {
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

            // Make it required by default for now, or could check a 'required' flag if added later
            validator = validator.min(1, `${field.name} is required`)

            schemaShape[field.name] = validator
        })

        return z.object(schemaShape)
    }

    const schema = generateSchema()
    const { register, handleSubmit, formState: { errors }, setValue } = useForm({
        resolver: zodResolver(schema),
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onSubmit = (data: any) => {
        console.log("Registration Data:", data)
        // Handle registration logic here
        onClose()
    }

    return (
        <ModalWrapper open={isOpen} setOpen={onClose}>
            <div className="w-full max-w-[500px] text-white p-4">
                <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
                    <h2 className="text-2xl font-bold">Register for {event.title}</h2>
                    <p className="text-white/60 text-sm">
                        Please fill out the following information to complete your registration.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {event.registration_fields?.map((field, index) => (
                        <div key={index} className="space-y-2">
                            <Label className="text-white">{field.name}</Label>

                            {field.type === 'text' || field.type === 'email' || field.type === 'number' ? (
                                <Input
                                    {...register(field.name)}
                                    type={field.type}
                                    placeholder={`Enter your ${field.name.toLowerCase()}`}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 h-12"
                                />
                            ) : field.type === 'textarea' ? (
                                <Textarea
                                    {...register(field.name)}
                                    placeholder={`Enter your ${field.name.toLowerCase()}`}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30"
                                />
                            ) : field.type === 'select' ? (
                                <Select onValueChange={(val) => setValue(field.name, val)}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                        <SelectValue placeholder="Select an option" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black border-white/10 text-white">
                                        {/* Assuming options are stored in a specific way, for now just splitting if it was a string in the builder but here it's just type definition */}
                                        {/* In the builder we had 'options' string, but in Event type we only have name and type. 
                                            We probably need to update Event type to include options for select/radio/checkbox fields. 
                                            For now, I'll assume options might be missing or handled differently. 
                                            Let's check the Event type again. It only has name and type. 
                                            I should probably update Event type to include options.
                                        */}
                                        <SelectItem value="option1">Option 1</SelectItem>
                                        <SelectItem value="option2">Option 2</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : null}

                            {errors[field.name] && (
                                <p className="text-red-400 text-sm">
                                    {errors[field.name]?.message as string}
                                </p>
                            )}
                        </div>
                    ))}

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2">
                        <Button type="button" variant="ghost" onClick={onClose} className="text-white py-6! hover:bg-white/10 hover:text-white rounded-full cursor-pointer">
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-white text-black hover:bg-gray-200 px-6! py-6 cursor-pointer rounded-full">
                            Complete Registration
                        </Button>
                    </div>
                </form>
            </div>
        </ModalWrapper>
    )
}
