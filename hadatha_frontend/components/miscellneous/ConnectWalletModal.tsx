import { Button } from "../ui/button";
import ModalWrapper from "./ModalWrapper";
import { useConnectWallet, useCurrentAccount, useWallets } from "@mysten/dapp-kit";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { CheckCircle, Loader2 } from "lucide-react";
import { isEnokiWallet } from "@mysten/enoki";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useCheckAccountExistence } from "@/hooks/sui/useCheckAccountExistence";

const ConnectWalletModal = ({ open, setOpen, redirectUrl }: { open: boolean, setOpen: (open: boolean) => void, redirectUrl?: string }) => {
    const { mutateAsync: connectWallet } = useConnectWallet()
    const wallets = useWallets()
    const router = useRouter()
    const account = useCurrentAccount()
    const { hasAccount, isLoading } = useCheckAccountExistence()
    const regularWallets = wallets.filter((wallet) => !isEnokiWallet(wallet));
    const [isMobile, setIsMobile] = useState(false);

    // Use ref to track if we've already handled this connection
    const hasHandledConnectionRef = useRef(false);

    // Detect if user is on mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
        };
        checkMobile();
    }, []);

    // Reset the flag when modal closes
    useEffect(() => {
        if (!open) {
            hasHandledConnectionRef.current = false;
        }
    }, [open]);

    // Watch for account connection and redirect intelligently
    useEffect(() => {
        // Only proceed if we have an account, modal is open, not loading, and haven't handled this connection yet
        if (account?.address && open && !isLoading && !hasHandledConnectionRef.current) {
            // Mark that we're handling this connection
            hasHandledConnectionRef.current = true;

            // Close modal immediately
            setOpen(false);

            // Small delay for UX, then redirect
            const timeoutId = setTimeout(() => {
                if (hasAccount) {
                    // User has account - redirect to original destination or dashboard
                    const destination = redirectUrl || "/dashboard";
                    router.push(destination);
                } else {
                    // User doesn't have account - redirect to create account
                    const redirectPath = redirectUrl
                        ? `/create-account?redirect=${encodeURIComponent(redirectUrl)}`
                        : "/create-account";
                    router.push(redirectPath);
                }
            }, 300);

            // Cleanup function
            return () => {
                clearTimeout(timeoutId);
            };
        }
    }, [account?.address, open, hasAccount, isLoading, redirectUrl, router, setOpen]);

    if (!open) return null;

    // Show loading state when we have an account and are about to redirect
    // eslint-disable-next-line react-hooks/refs
    const showLoadingState = account?.address && (isLoading || hasHandledConnectionRef.current);

    return (
        <ModalWrapper open={open} setOpen={setOpen}>
            <div className="p-6 rounded-2xl flex flex-col gap-4">
                <div className="flex flex-col gap-1 items-center">
                    <h1 className="text-2xl font-bold text-white w-full max-w-[400px] text-center">Connect Wallet To Continue</h1>
                    <p className="text-white/70 mt-2 w-full max-w-[320px] text-center">
                        Connect your wallet to {hasAccount ? "continue" : "register and start minting tickets"}
                    </p>
                </div>
                <div className="w-full flex flex-col gap-2 items-center">
                    {showLoadingState ? (
                        <div className="flex items-center justify-center gap-2 text-white bg-white/20 rounded-full w-full py-4">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {/* eslint-disable-next-line react-hooks/refs */}
                            {hasHandledConnectionRef.current ? "Redirecting..." : "Checking account..."}
                        </div>
                    ) : (
                        <>
                            {!account?.address ? (
                                <>
                                    {/* Mobile - Show individual wallet buttons */}
                                    {isMobile ? (
                                        Array.isArray(regularWallets) && regularWallets.length !== 0 ? (
                                            regularWallets.map((wallet) => (
                                                <Button
                                                    key={wallet.name}
                                                    onClick={() => connectWallet({ wallet })}
                                                    className="w-full rounded-full px-12 py-5 min-h-[50px] cursor-pointer bg-white/5 backdrop-blur-lg border border-white/10 active:scale-95 hover:scale-x-105 transition-all duration-300 flex justify-center items-center gap-2"
                                                >
                                                    <Image src={wallet.icon} alt={wallet.name} width={24} height={24} />
                                                    Connect {wallet.name}
                                                </Button>
                                            ))
                                        ) : (
                                            <div className="text-white/70 text-center py-4 px-6 bg-white/5 rounded-xl border border-white/10">
                                                <p className="mb-2">No wallets detected.</p>
                                                <p className="text-sm text-white/50">Please install a Sui wallet app to continue.</p>
                                            </div>
                                        )
                                    ) : (
                                        /* Desktop - Individual wallet buttons */
                                        <>
                                            {Array.isArray(regularWallets) && regularWallets.length !== 0 ? (
                                                regularWallets.map((wallet) => (
                                                    <Button
                                                        key={wallet.name}
                                                        onClick={() => connectWallet({ wallet })}
                                                        className="w-full rounded-full px-12 py-5 min-h-[50px] cursor-pointer bg-white/5 backdrop-blur-lg border border-white/10 active:scale-95 hover:scale-x-105 transition-all duration-300 flex justify-center items-center gap-2"
                                                    >
                                                        <Image src={wallet.icon} alt={wallet.name} width={24} height={24} />
                                                        Connect {wallet.name}
                                                    </Button>
                                                ))
                                            ) : (
                                                <div className="text-white/70 text-center py-4 px-6 bg-white/5 rounded-xl border border-white/10">
                                                    <p className="mb-2">No wallets detected.</p>
                                                    <p className="text-sm text-white/50">Please install a Sui wallet extension to continue.</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center justify-center gap-2 text-white bg-green-600/20 border border-green-500/50 rounded-full w-full py-4">
                                    <CheckCircle size={24} className="text-green-400" />
                                    <span className="text-green-400 font-medium">Wallet Connected</span>
                                </div>
                            )}
                        </>
                    )}

                    <div className="w-full flex items-center gap-2 my-2">
                        <div className="flex-1 border-t border-white/20"></div>
                        <span className="text-white/50 text-sm px-2">Or</span>
                        <div className="flex-1 border-t border-white/20"></div>
                    </div>

                    <Button
                        disabled
                        className="w-full rounded-full px-12 py-5 min-h-[50px] bg-white/5 backdrop-blur-lg border border-white/10 flex justify-center items-center gap-2 opacity-50 cursor-not-allowed"
                    >
                        <FcGoogle size={24} />
                        <span className="text-white/70">
                            Google Sign In <span className="text-xs text-white/50">(Coming Soon)</span>
                        </span>
                    </Button>

                    <Button
                        disabled
                        className="w-full rounded-full px-12 py-5 min-h-[50px] bg-white/5 backdrop-blur-lg border border-white/10 flex justify-center items-center gap-2 opacity-50 cursor-not-allowed"
                    >
                        <FaFacebook size={24} className="text-blue-500" />
                        <span className="text-white/70">
                            Facebook Sign In <span className="text-xs text-white/50">(Coming Soon)</span>
                        </span>
                    </Button>
                </div>
            </div>
        </ModalWrapper>
    )
}

export default ConnectWalletModal