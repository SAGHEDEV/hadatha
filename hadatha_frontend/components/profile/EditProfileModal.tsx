"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ModalWrapper from "@/components/miscellneous/ModalWrapper"
import { Loader2, Camera, User } from "lucide-react"
import { useEditProfile } from "@/hooks/sui/useEditProfile"
import { AccountDetails } from "@/types"
import Image from "next/image"
import StatusModal from "@/components/miscellneous/StatusModal"
import { useState } from "react"

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    bio: z.string().max(200, "Bio must be under 200 characters"),
    twitter: z.string(),
    github: z.string(),
    website: z.string(),
    imageUrl: z.string().min(1, "Avatar URL is required").url("Invalid image URL"),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface EditProfileModalProps {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
    currentProfile?: AccountDetails
    onSuccess?: () => void
}

export default function EditProfileModal({ isOpen, setIsOpen, currentProfile, onSuccess }: EditProfileModalProps) {
    const { editProfile, isUpdating } = useEditProfile()
    const [statusModal, setStatusModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        description: string;
    }>({
        isOpen: false,
        type: 'success',
        title: '',
        description: '',
    })

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: currentProfile?.name || "",
            email: currentProfile?.email || "",
            bio: currentProfile?.bio || "",
            twitter: currentProfile?.twitter || "",
            github: currentProfile?.github || "",
            website: currentProfile?.website || "",
            imageUrl: currentProfile?.image_url || "",
        },
    })

    const previewImage = watch("imageUrl")

    useEffect(() => {
        if (currentProfile) {
            reset({
                name: currentProfile.name,
                email: currentProfile.email,
                bio: currentProfile.bio || "",
                twitter: currentProfile.twitter || "",
                github: currentProfile.github || "",
                website: currentProfile.website || "",
                imageUrl: currentProfile.image_url,
            })
        }
    }, [currentProfile, reset])

    const onSubmit = async (values: ProfileFormValues) => {
        if (!currentProfile?.id) return

        try {
            await editProfile({
                accountId: currentProfile.id,
                name: values.name,
                email: values.email,
                bio: values.bio,
                twitter: values.twitter,
                github: values.github,
                website: values.website,
                imageUrl: values.imageUrl,
            })

            setStatusModal({
                isOpen: true,
                type: 'success',
                title: 'Profile Updated',
                description: 'Your on-chain identity has been refreshed successfully.',
            })

            onSuccess?.()
        } catch (error) {
            console.error(error)
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Update Failed',
                description: 'There was an error updating your profile. Please try again.',
            })
        }
    }

    return (
        <ModalWrapper
            open={isOpen}
            setOpen={setIsOpen}
        >
            <div className="max-w-md w-full bg-[#1A1A1A] p-8 rounded-3xl border border-white/10 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Edit Profile</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                                {previewImage ? (
                                    <Image
                                        src={previewImage}
                                        alt="Profile Preview"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <User className="w-10 h-10 text-white/20" />
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full cursor-pointer">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <p className="text-white/40 text-xs">Profile image URL</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-white/60">Full Name</Label>
                            <Input
                                id="name"
                                {...register("name")}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-white/20 h-12"
                                placeholder="Your display name"
                            />
                            {errors.name && (
                                <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio" className="text-white/60">Bio / About</Label>
                            <textarea
                                id="bio"
                                {...register("bio")}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 min-h-[100px] resize-none"
                                placeholder="Tell us about yourself..."
                            />
                            {errors.bio && (
                                <p className="text-red-400 text-xs mt-1">{errors.bio.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="twitter" className="text-white/60">Twitter</Label>
                                <Input
                                    id="twitter"
                                    {...register("twitter")}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-white/20 h-10"
                                    placeholder="@handle"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="github" className="text-white/60">GitHub</Label>
                                <Input
                                    id="github"
                                    {...register("github")}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-white/20 h-10"
                                    placeholder="username"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website" className="text-white/60">Website</Label>
                            <Input
                                id="website"
                                {...register("website")}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-white/20 h-10"
                                placeholder="https://yourwebsite.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imageUrl" className="text-white/60">Avatar URL</Label>
                            <Input
                                id="imageUrl"
                                {...register("imageUrl")}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-white/20 h-12"
                                placeholder="https://example.com/avatar.png"
                            />
                            {errors.imageUrl && (
                                <p className="text-red-400 text-xs mt-1">{errors.imageUrl.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 text-white border border-white/10 hover:bg-white/5 h-12"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isUpdating}
                            className="flex-1 bg-white text-black hover:bg-white/90 font-bold h-12"
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
            <StatusModal
                isOpen={statusModal.isOpen}
                onClose={() => {
                    setStatusModal(prev => ({ ...prev, isOpen: false }));
                    if (statusModal.type === 'success') {
                        setIsOpen(false);
                    }
                }}
                type={statusModal.type}
                title={statusModal.title}
                description={statusModal.description}
            />
        </ModalWrapper>
    )
}
