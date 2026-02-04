"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, UserPlus } from "lucide-react"
import { useCreateAccount } from "@/hooks/sui/useCreateAccount"

const createProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    imageUrl: z.string().url("Invalid image URL").or(z.string().length(0)),
})

type CreateProfileFormValues = z.infer<typeof createProfileSchema>

interface CreateProfileViewProps {
    onSuccess?: () => void
}

export default function CreateProfileView({ onSuccess }: CreateProfileViewProps) {
    const { createAccount, isCreating } = useCreateAccount()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateProfileFormValues>({
        resolver: zodResolver(createProfileSchema),
    })

    const onSubmit = async (values: CreateProfileFormValues) => {
        try {
            await createAccount({
                name: values.name,
                email: values.email,
                imageUrl: values.imageUrl,
            })
            onSuccess?.()
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="max-w-md mx-auto py-12 px-6 bg-white/5 border border-white/10 rounded-3xl mt-12">
            <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                    <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Create Your Profile</h1>
                <p className="text-white/60">Initialize your on-chain identity to start organizing and attending events.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="create-name" className="text-white/60">Full Name</Label>
                        <Input
                            id="create-name"
                            {...register("name")}
                            className="bg-black/20 border-white/10 text-white placeholder:text-white/20 h-12"
                            placeholder="Alex Doe"
                        />
                        {errors.name && (
                            <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="create-email" className="text-white/60">Email Address</Label>
                        <Input
                            id="create-email"
                            {...register("email")}
                            className="bg-black/20 border-white/10 text-white placeholder:text-white/20 h-12"
                            placeholder="alex@example.com"
                        />
                        {errors.email && (
                            <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="create-imageUrl" className="text-white/60">Avatar URL (Optional)</Label>
                        <Input
                            id="create-imageUrl"
                            {...register("imageUrl")}
                            className="bg-black/20 border-white/10 text-white placeholder:text-white/20 h-12"
                            placeholder="https://..."
                        />
                        {errors.imageUrl && (
                            <p className="text-red-400 text-xs mt-1">{errors.imageUrl.message}</p>
                        )}
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isCreating}
                    className="w-full bg-white text-black hover:bg-white/90 font-bold h-12 rounded-full"
                >
                    {isCreating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Initializing...
                        </>
                    ) : (
                        "Complete Profile"
                    )}
                </Button>
            </form>
        </div>
    )
}
