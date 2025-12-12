"use client"

import { Button } from "@/components/ui/button"
import { Camera, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect, useState, Suspense } from "react"
import Image from "next/image"
import Logo from "@/components/miscellneous/Logo"
import { useRouter, useSearchParams } from "next/navigation"
import { useCheckAccountExistence } from "@/hooks/sui/useCheckAccountExistence"
import LoadingState from "@/components/miscellneous/LoadingState"
import { useCreateAccount } from "@/hooks/sui/useCreateAccount"
import { useUploadToWalrus } from "@/hooks/useUploadToWalrus"
import StatusModal from "@/components/miscellneous/StatusModal"
import { useCurrentAccount } from "@mysten/dapp-kit"

const formSchema = z.object({
    image_url: z
        .any()
        .optional(),
    fullName: z.string().min(4, "Full name must be at least 4 characters"),
    email: z.email("Invalid email address"),
})

type FormValues = z.infer<typeof formSchema>

const CreateAccountForm = () => {
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const currentAccount = useCurrentAccount();
    const router = useRouter()
    const { hasAccount, isLoading } = useCheckAccountExistence();
    const { createAccount, isCreating } = useCreateAccount();
    const { uploadToWalrus, isUploading } = useUploadToWalrus();
    const [openEffectModal, setOpenEffectModal] = useState({ open: false, status: "success" as "success" | "error", message: "", description: "" })
    const redirectUrl = useSearchParams().get("redirect")

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    })

    const onSubmit = async (data: FormValues) => {
        console.log(data)
        let image_url = ""
        if (data.image_url && data.image_url.length > 0) {
            try {
                const blobUrl = await uploadToWalrus(data.image_url[0])
                console.log(blobUrl)
                image_url = blobUrl
            } catch (err) {
                console.log(err)
            }
        }
        await createAccount({
            name: data.fullName,
            email: data.email,
            image_url: image_url
        }).then(() => {
            setOpenEffectModal({ open: true, status: "success", message: "Account created successfully", description: "You will be redirected to dashboard in a few seconds" })
        }).catch((err) => {
            setOpenEffectModal({ open: true, status: "error", message: "Failed to create account", description: err.message })
        })
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    useEffect(() => {
        if (!currentAccount) {
            router.push("/")
        }
    }, [currentAccount, router])

    useEffect(() => {
        if (hasAccount && !isLoading) {
            router.push(redirectUrl || "/dashboard")
        }
    }, [hasAccount, isLoading, redirectUrl, router])

    if (isLoading && !hasAccount) {
        return <LoadingState loadingText="Checking account status..." />
    }

    return (
        <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 relative overflow-hidden bg-black">
            <video
                src="/videos/landing-bg.mp4"
                autoPlay
                loop
                muted
                className="absolute inset-0 w-full h-full object-cover z-0"
            />

            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10" />
            {/* Background Elements for depth */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-black/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-black/20 rounded-full blur-[100px] pointer-events-none"></div>

            <Logo />

            <div className="mt-5 w-full max-w-lg p-8 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] flex flex-col gap-8 relative z-10">
                <div className="flex flex-col gap-2 text-center">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Create Profile</h1>
                    <p className="text-white/60 text-sm">Set up your profile to get started</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                    {/* Profile Picture Upload */}
                    <div className="flex justify-center">
                        <div className="relative group cursor-pointer">
                            <div className="w-28 h-28 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-white/30 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                {imagePreview ? (
                                    <Image src={imagePreview} alt="Profile" width={112} height={112} className="w-full h-full object-cover" />
                                ) : (
                                    <Camera className="w-10 h-10 text-white/40 group-hover:text-white/80 transition-colors" />
                                )}
                            </div>
                            <label className="absolute inset-0 cursor-pointer">
                                <input
                                    {...register("image_url", {
                                        onChange: (e) => handleImageChange(e)
                                    })}
                                    type="file"
                                    accept="image/*"
                                    className="hidden cursor-pointer"
                                />
                            </label>
                            <div className="relative flex justify-center items-center">
                                <div className="absolute bottom-1 right-1 w-8 h-8 bg-white backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center pointer-events-none">
                                    <Plus className="w-4 h-4 text-black" />
                                </div>
                            </div>
                            {errors.image_url && <span className="text-red-400 text-xs ml-2 animate-pulse">{errors?.image_url?.message as string}</span>}
                        </div>
                    </div>

                    {/* Full Name */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-white/80 ml-1">Full Name</label>
                        <div className="relative">
                            <input
                                {...register("fullName")}
                                type="text"
                                placeholder="John Doe"
                                className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                            />
                        </div>
                        {errors.fullName && <span className="text-red-400 text-xs ml-2 animate-pulse">{errors.fullName.message}</span>}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-white/80 ml-1">Email Address</label>
                        <div className="relative">
                            <input
                                {...register("email")}
                                type="email"
                                placeholder="john@example.com"
                                className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                            />
                        </div>
                        {errors.email && <span className="text-red-400 text-xs ml-2 animate-pulse">{errors.email.message}</span>}
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting || isUploading || isCreating}
                        className="cursor-pointer w-full mt-4 rounded-full py-7 text-lg font-semibold bg-white text-black hover:bg-gray-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting || isUploading || isCreating ? "Creating..." : "Create Account"}
                    </Button>
                </form>
            </div>
            <StatusModal isOpen={openEffectModal.open}
                onClose={() => setOpenEffectModal({ open: false, status: "success", message: "", description: "" })}
                type={openEffectModal.status} title={openEffectModal.message} description={openEffectModal.description} actionLabel="Close"
                onAction={() => { setOpenEffectModal({ open: false, status: "success", message: "", description: "" }); router.push(redirectUrl ? "/dashboard?redirect=" + redirectUrl : "/dashboard") }} />
        </div>
    )
}

const CreateAccountPage = () => {
    return (
        <Suspense fallback={<LoadingState loadingText="Loading..." />}>
            <CreateAccountForm />
        </Suspense>
    )
}

export default CreateAccountPage