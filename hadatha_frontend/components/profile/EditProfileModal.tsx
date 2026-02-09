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
    bio: z.string().max(400, "Bio must be under 400 characters"),
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
            <div className="w-full max-w-2xl mx-auto bg-[#1A1A1A] rounded-3xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-[#1A1A1A] border-b border-white/10 px-6 py-4 rounded-t-3xl z-10">
                    <h2 className="text-xl sm:text-2xl font-bold text-white text-center">Edit Profile</h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Profile Image Section */}
                    <div className="flex flex-col items-center gap-3 pb-4">
                        <div className="relative group">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center relative">
                                {previewImage ? (
                                    <Image
                                        src={previewImage}
                                        alt="Profile Preview"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-white/20" />
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full cursor-pointer">
                                <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                        </div>
                        <p className="text-white/40 text-xs text-center">Profile image URL</p>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {/* Name & Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-white/60 text-sm">Full Name *</Label>
                                <Input
                                    id="name"
                                    {...register("name")}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-white/20 h-11"
                                    placeholder="Your display name"
                                />
                                {errors.name && (
                                    <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-white/60 text-sm">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register("email")}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-white/20 h-11"
                                    placeholder="you@example.com"
                                />
                                {errors.email && (
                                    <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="space-y-2">
                            <Label htmlFor="bio" className="text-white/60 text-sm">Bio / About</Label>
                            <textarea
                                id="bio"
                                {...register("bio")}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 min-h-[80px] sm:min-h-[100px] resize-none"
                                placeholder="Tell us about yourself..."
                            />
                            <div className="flex justify-between items-center">
                                {errors.bio ? (
                                    <p className="text-red-400 text-xs">{errors.bio.message}</p>
                                ) : (
                                    <p className="text-white/30 text-xs">Max 400 characters</p>
                                )}
                                <p className="text-white/30 text-xs">{watch("bio")?.length || 0}/400</p>
                            </div>
                        </div>

                        {/* Avatar URL */}
                        <div className="space-y-2">
                            <Label htmlFor="imageUrl" className="text-white/60 text-sm">Avatar URL *</Label>
                            <Input
                                id="imageUrl"
                                {...register("imageUrl")}
                                className="bg-white/5 border-white/10 text-white text-sm placeholder:text-white/20 focus-visible:ring-white/20 h-11"
                                placeholder="https://example.com/avatar.png"
                            />
                            {errors.imageUrl && (
                                <p className="text-red-400 text-xs mt-1">{errors.imageUrl.message}</p>
                            )}
                        </div>

                        {/* Social Links */}
                        <div className="pt-2">
                            <h3 className="text-white/70 text-sm font-semibold mb-3">Social Links</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="twitter" className="text-white/60 text-sm">Twitter</Label>
                                    <Input
                                        id="twitter"
                                        {...register("twitter")}
                                        className="bg-white/5 border-white/10 text-white text-sm placeholder:text-white/20 focus-visible:ring-white/20 h-10"
                                        placeholder="@handle"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="github" className="text-white/60 text-sm">GitHub</Label>
                                    <Input
                                        id="github"
                                        {...register("github")}
                                        className="bg-white/5 border-white/10 text-white text-sm placeholder:text-white/20 focus-visible:ring-white/20 h-10"
                                        placeholder="username"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 mt-4">
                                <Label htmlFor="website" className="text-white/60 text-sm">Website</Label>
                                <Input
                                    id="website"
                                    {...register("website")}
                                    className="bg-white/5 border-white/10 text-white text-sm placeholder:text-white/20 focus-visible:ring-white/20 h-10"
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 sticky bottom-0 bg-[#1A1A1A] pb-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 text-white border border-white/10 hover:bg-white/5 h-11 text-sm font-medium"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isUpdating}
                            className="flex-1 bg-white text-black hover:bg-white/90 font-semibold h-11 text-sm"
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