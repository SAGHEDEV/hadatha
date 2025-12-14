"use client"

import Header from "@/components/miscellneous/Header";
import Footer from "@/components/miscellneous/Footer";
import { useCheckAccountExistence } from "@/hooks/sui/useCheckAccountExistence";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import LoadingState from "@/components/miscellneous/LoadingState";

const MainLayout = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const currentAccount = useCurrentAccount()
    const { hasAccount, isLoading } = useCheckAccountExistence()
    const router = useRouter();
    const pathname = usePathname()


    useEffect(() => {
        if (currentAccount?.address && !hasAccount) {
            router.push(`/create-account?redirect=${pathname}`)
        }
    }, [currentAccount?.address, hasAccount])

    if (isLoading) return <LoadingState loadingText="Checking account status..." />
    return (
        <div className="min-h-screen flex flex-col bg-black text-white relative overflow-x-hidden max-w-[1440px] m-auto">
            <Header />
            <main className="flex-1 w-full max-w-7xl mx-auto px-6 pt-32 pb-12 relative z-10">
                {children}
            </main>
            <Footer />
        </div>
    )
}

export default MainLayout
