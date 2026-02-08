"use client"

import { useCurrentAccount } from "@mysten/dapp-kit"
import LaunchAppBtn from "@/components/miscellneous/LaunchAppBtn"
import { usePathname, useRouter } from "next/navigation"
import { useCheckAccountExistence } from "@/hooks/sui/useCheckAccountExistence"
import { useEffect, useRef } from "react"
import LoadingState from "@/components/miscellneous/LoadingState"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const currentAccount = useCurrentAccount()
    const pathname = usePathname()
    const { hasAccount, isLoading } = useCheckAccountExistence()
    const router = useRouter();

    const checkedAccount = useRef<string | null>(null)
    const isCheckingAccount = useRef(false)

    useEffect(() => {
        if (
            currentAccount?.address &&
            !isLoading &&
            checkedAccount.current !== currentAccount.address &&
            !isCheckingAccount.current
        ) {
            isCheckingAccount.current = true

            if (!hasAccount) {
                checkedAccount.current = currentAccount.address
                router.push(`/create-account?redirect=${pathname}`)
            } else {
                checkedAccount.current = currentAccount.address
            }

            isCheckingAccount.current = false
        }

        // Reset checked account when user disconnects
        if (!currentAccount?.address) {
            checkedAccount.current = null
        }
    }, [currentAccount?.address, hasAccount, isLoading, pathname, router])

    if (isLoading) return <LoadingState loadingText="Checking account status..." />

    if (!currentAccount) {
        return (
            <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-12 backdrop-blur-xl text-center">
                    <h1 className="text-2xl font-bold text-white">Connect Wallet</h1>
                    <p className="text-white/60 max-w-md">
                        You need to connect your wallet to access this page.
                    </p>
                    <LaunchAppBtn buttonText="Connect Wallet" redirectUrl={pathname} />
                </div>
            </div>
        )
    }

    return <>{children}</>
}
