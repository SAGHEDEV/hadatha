"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "../ui/button"
import { useState } from "react"
import ConnectWalletModal from "./ConnectWalletModal"

const LaunchAppBtn = () => {
    const [openConnectModal, setOpenConnectModal] = useState(false)
    return (
        <>
            <Button onClick={() => setOpenConnectModal(true)} className="rounded-full px-12! py-5! min-h-[50px] cursor-pointer bg-white text-black hover:bg-gray-300 border border-white/10 active:scale-95 hover:scale-x-105 transition-all duration-300">
                Launch App
                <span className="p-2 rounded-full bg-black">
                    <ArrowRight size={24} color="white" />
                </span>
            </Button>

            <ConnectWalletModal open={openConnectModal} setOpen={setOpenConnectModal} />
        </>
    )
}

export default LaunchAppBtn