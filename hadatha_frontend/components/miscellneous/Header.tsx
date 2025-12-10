"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Logo from "./Logo"
import { ConnectButton, useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit"
import { Wallet, User, LogOut } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const Header = () => {
    const pathname = usePathname()
    const router = useRouter()
    const account = useCurrentAccount()
    const { mutate: disconnect } = useDisconnectWallet()

    const navLinks = [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Events", href: "/events" },
        { name: "Create Event", href: "/events/create" },
    ]

    const handleDisconnect = () => {
        disconnect()
        router.push("/")
    }

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-40 px-6! py-4!">
            <div className="max-w-7xl mx-auto rounded-full bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 flex items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
                <Link href="/dashboard">
                    <Logo />
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`text-sm font-medium transition-colors hover:text-white ${pathname === link.href ? "text-white" : "text-white/60"
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    {account ? (
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20 hover:border-white/40 transition-all cursor-pointer">
                                    {/* Placeholder for Profile Image - using a generated avatar based on address for now */}
                                    <Image
                                        src={`https://ui-avatars.com/api/?name=${account.address.slice(0, 2)}&background=random`}
                                        alt="Profile"
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-4 bg-black/90 backdrop-blur-xl border border-white/10 text-white rounded-2xl mr-6 mt-2">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20">
                                            <Image
                                                src={`https://ui-avatars.com/api/?name=${account.address.slice(0, 2)}&background=random`}
                                                alt="Profile"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="font-bold text-sm truncate">User</span>
                                            <span className="text-xs text-white/50 truncate">{formatAddress(account.address)}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Button
                                            variant="ghost"
                                            className="justify-start gap-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl h-10 cursor-pointer"
                                            onClick={() => router.push("/profile")}
                                        >
                                            <User className="w-4 h-4" />
                                            Profile
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl h-10 cursor-pointer"
                                            onClick={handleDisconnect}
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Disconnect
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    ) : (
                        <ConnectButton className="rounded-full! px-6! py-2! bg-white/10! hover:bg-white/20! text-white! border border-white/10! transition-all duration-300 font-sans!" connectText={
                            <span className="flex items-center gap-2 text-sm">
                                <Wallet className="w-4 h-4" />
                                Connect
                            </span>
                        } />
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header
