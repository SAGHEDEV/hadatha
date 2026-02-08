"use client"

import Header from "@/components/miscellneous/Header";
import Footer from "@/components/miscellneous/Footer";

const MainLayout = ({
    children,
}: {
    children: React.ReactNode;
}) => {


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