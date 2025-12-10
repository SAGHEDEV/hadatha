import { Button } from "../ui/button";
import ModalWrapper from "./ModalWrapper";
import { ConnectButton, useConnectWallet, useCurrentAccount, useWallets } from "@mysten/dapp-kit";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { CheckCircle, Wallet } from "lucide-react";
import { isEnokiWallet } from "@mysten/enoki";
import Image from "next/image";
import { useRouter } from "next/navigation";


const ConnectWalletModal = ({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) => {
    const { mutateAsync: connectWallet } = useConnectWallet()
    const wallets = useWallets()
    const router = useRouter()
    const account = useCurrentAccount()
    const regularWallets = wallets.filter((wallet) => !isEnokiWallet(wallet));
    if (!open) return null;
    return (
        <ModalWrapper open={open} setOpen={setOpen}>
            <div className="p-6 rounded-2xl flex flex-col gap-4">
                <div className="flex flex-col gap-1 items-center">
                    <h1 className="text-2xl font-bold text-white w-full max-w-[400px]">Connect Wallet To Continue</h1>
                    <p className="text-white/70 mt-2 w-full max-w-[320px]">Connect your wallet so we can register you and start minting tickets</p>
                </div>
                <div className="w-full flex flex-col gap-2 items-center">
                    <>
                        {!account?.address ? <ConnectButton className="w-full lg:hidden! rounded-full! px-12! min-h-[50px] cursor-pointer bg-white/5! backdrop-blur-lg! text-white! border border-white/10 active:scale-95 hover:scale-x-105 transition-all duration-300 font-sans!" connectText={
                            <span className="flex justify-center gap-2 items-center text-white! w-full">
                                <Wallet className="h-4 w-4" color="#ffffff" />
                                Connect Wallet
                            </span>
                        } /> : <div className="flex items-center justify-center gap-2 text-white bg-white/20 rounded-full w-full py-4"><CheckCircle size={24} color="green" /> Wallet Connected</div>}
                        {Array.isArray(regularWallets) && regularWallets.length !== 0 ? regularWallets.map((wallet) => (
                            <Button key={wallet.name} onClick={() => connectWallet({ wallet }, {
                                onSuccess: () => {
                                    router.push("/dashboard")
                                }
                            })} disabled={!!account} className="w-full hidden rounded-full px-12! py-5! min-h-[50px] cursor-pointer bg-white/5 backdrop-blur-lg border border-white/10 active:scale-95 hover:scale-x-105 transition-all duration-300 lg:flex justify-center items-center gap-2 disabled:cursor-not-allowed">
                                <Image src={wallet.icon} alt={wallet.name} width={24} height={24} />
                                Connect {wallet.name} Wallet
                            </Button>
                        )) : null}
                    </>

                    <div className="w-full flex items-center gap-2">
                        <div className="w-full border border-white/20"></div>
                        <span className="text-white/70">Or</span>
                        <div className="w-full border border-white/20"></div>
                    </div>
                    <Button disabled className="w-full rounded-full px-12! py-5! min-h-[50px] cursor-pointer bg-white/5 backdrop-blur-lg border border-white/10 active:scale-95 hover:scale-x-105 transition-all duration-300 flex justify-center items-center gap-2 disabled:cursor-not-allowed">
                        <FcGoogle size={24} color="white" />
                        Google Sign In
                    </Button>
                    <Button disabled className="w-full rounded-full px-12! py-5! min-h-[50px] cursor-pointer bg-white/5 backdrop-blur-lg border border-white/10 active:scale-95 hover:scale-x-105 transition-all duration-300 flex justify-center items-center gap-2 disabled:cursor-not-allowed">
                        <FaFacebook size={24} color="white" />
                        Facebook Sign In
                    </Button>
                </div>
            </div>
        </ModalWrapper>
    )
}

export default ConnectWalletModal