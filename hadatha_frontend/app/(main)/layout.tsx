"use client"

import { useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useRouter } from "next/navigation";
import Header from "@/components/miscellneous/Header";
import Footer from "@/components/miscellneous/Footer";

const MainLayout = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const router = useRouter();
    const account = useCurrentAccount();
    // const redirect = useSearchParams().get("redirect") || "/";

    useEffect(() => {
        if (!account) {
            router.push("/");
        }
    }, [account]);
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
