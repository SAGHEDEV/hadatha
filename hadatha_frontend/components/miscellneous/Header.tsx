"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Logo from "./Logo"
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit"
import { User, LogOut, Menu, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useCheckAccountExistence } from "@/hooks/sui/useCheckAccountExistence"
import LaunchAppBtn from "./LaunchAppBtn"

const Header = () => {
    const pathname = usePathname()
    const router = useRouter()
    const currentAccount = useCurrentAccount()
    const { mutate: disconnect } = useDisconnectWallet()
    const { account } = useCheckAccountExistence()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const navLinks = [
        { name: "Dashboard", href: "/dashboard", disabled: !currentAccount },
        { name: "Events", href: "/events", disabled: false },
        { name: "Create Event", href: "/events/create", disabled: !currentAccount },
    ]

    const handleDisconnect = () => {
        disconnect()
        setIsMobileMenuOpen(false)
        router.push("/")
    }

    const handleNavClick = (href: string, disabled: boolean) => {
        if (!disabled) {
            setIsMobileMenuOpen(false)
            router.push(href)
        }
    }

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
    }

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-40 px-4 md:px-6 py-4">
                <div className="max-w-7xl mx-auto rounded-full bg-white/5 backdrop-blur-xl border border-white/10 px-4 md:px-6 py-3 flex items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
                    <Logo />

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`text-sm font-medium transition-colors hover:text-white ${pathname === link.href ? "text-white" : "text-white/60"
                                    } ${link.disabled ? "text-white/40 cursor-not-allowed pointer-events-none" : ""}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop User Menu */}
                    <div className="hidden md:flex items-center gap-4">
                        {currentAccount ? (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20 hover:border-white/40 transition-all cursor-pointer">
                                        <Image
                                            src={account?.image_url ? account?.image_url : `https://ui-avatars.com/api/?name=${account?.name.slice(0, 2)}&background=random`}
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
                                                    src={(account?.image_url && account?.image_url !== "") ? account?.image_url : `https://ui-avatars.com/api/?name=${account?.name.slice(0, 2)}&background=random`}
                                                    alt="Profile"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="font-bold text-sm truncate">{account?.name}</span>
                                                <span className="text-xs text-white/50 truncate">{formatAddress(currentAccount?.address as string)}</span>
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
                            <LaunchAppBtn buttonText="Connect Wallet" redirectUrl="/" />
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Mobile Menu Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-[280px] bg-black/95 backdrop-blur-xl border-l border-white/10 z-40 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full p-6">
                    {/* Mobile Menu Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-white font-bold text-lg">Menu</h2>
                        <button
                            onClick={closeMobileMenu}
                            className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer"
                            aria-label="Close menu"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* User Profile Section (Mobile) */}
                    {currentAccount && account && (
                        <div className="flex items-center gap-3 p-4 mb-6 bg-white/5 rounded-2xl border border-white/10">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/20">
                                <Image
                                    src={(account?.image_url && account?.image_url !== "") ? account?.image_url : `https://ui-avatars.com/api/?name=${account?.name.slice(0, 2)}&background=random`}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex flex-col overflow-hidden flex-1">
                                <span className="font-bold text-sm text-white truncate">{account?.name}</span>
                                <span className="text-xs text-white/50 truncate">{formatAddress(currentAccount?.address as string)}</span>
                            </div>
                        </div>
                    )}

                    {/* Navigation Links */}
                    <nav className="flex flex-col gap-2 mb-6">
                        {navLinks.map((link) => (
                            <button
                                key={link.name}
                                onClick={() => handleNavClick(link.href, link.disabled)}
                                disabled={link.disabled}
                                className={`text-left px-4 py-3 rounded-xl text-base font-medium transition-all ${pathname === link.href
                                        ? "bg-white/10 text-white"
                                        : "text-white/60 hover:bg-white/5 hover:text-white"
                                    } ${link.disabled ? "text-white/30 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                                {link.name}
                            </button>
                        ))}
                    </nav>

                    {/* Divider */}
                    <div className="border-t border-white/10 my-4" />

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 mt-auto">
                        {currentAccount ? (
                            <>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl h-12 cursor-pointer"
                                    onClick={() => {
                                        closeMobileMenu()
                                        router.push("/profile")
                                    }}
                                >
                                    <User className="w-5 h-5" />
                                    <span>My Profile</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl h-12 cursor-pointer"
                                    onClick={handleDisconnect}
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Disconnect Wallet</span>
                                </Button>
                            </>
                        ) : (
                            <div onClick={closeMobileMenu}>
                                <LaunchAppBtn buttonText="Connect Wallet" redirectUrl="/" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Header