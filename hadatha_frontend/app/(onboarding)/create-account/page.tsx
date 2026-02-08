"use client"

import { useEffect, useState, Suspense } from "react"
import Logo from "@/components/miscellneous/Logo"
import { useRouter, useSearchParams } from "next/navigation"
import { useCheckAccountExistence } from "@/hooks/sui/useCheckAccountExistence"
import LoadingState from "@/components/miscellneous/LoadingState"
import StatusModal from "@/components/miscellneous/StatusModal"
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit"
import CreateAccountForm from "@/components/profile/CreateAccountForm"

const CreateAccountPageContent = () => {
    const currentAccount = useCurrentAccount();
    const { mutate: disconnect } = useDisconnectWallet();
    const router = useRouter()
    const { hasAccount, isLoading } = useCheckAccountExistence();
    const [openEffectModal, setOpenEffectModal] = useState({ open: false, status: "success" as "success" | "error", message: "", description: "" })
    const redirectUrl = useSearchParams().get("redirect")

    const handleSuccess = () => {
        setOpenEffectModal({ open: true, status: "success", message: "Account created successfully", description: "You will be redirected to dashboard in a few seconds" })
    }

    const handleFailure = (error: Error) => {
        setOpenEffectModal({ open: true, status: "error", message: "Failed to create account", description: error.message })
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

            <CreateAccountForm onSuccess={handleSuccess} onFailure={handleFailure} />

            <div className="flex justify-center mt-8">
                <button
                    type="button"
                    onClick={() => {
                        disconnect();
                        router.push("/");
                    }}
                    className="text-white/40 hover:text-white text-sm transition-colors"
                >
                    Disconnect & Exit
                </button>
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
            <CreateAccountPageContent />
        </Suspense>
    )
}

export default CreateAccountPage