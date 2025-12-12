import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { REGISTRY_PACKAGE_ID, HADATHA_MODULE, CLOCK_ID } from "@/lib/constant";

interface MintNFTParams {
    eventId: string;
    accountId: string;
}

export const useMintAttendanceNFT = () => {
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ eventId, accountId }: MintNFTParams) => {
            if (!account) {
                throw new Error('Wallet not connected');
            }

            try {
                const tx = new Transaction();

                tx.moveCall({
                    target: `${REGISTRY_PACKAGE_ID}::${HADATHA_MODULE}::mint_attendance_nft`,
                    arguments: [
                        tx.object(eventId),
                        tx.object(accountId),
                        tx.object(CLOCK_ID),
                    ],
                });

                const result = await signAndExecuteTransaction({
                    transaction: tx,
                });

                console.log('✅ Attendance NFT minted successfully:', result);

                return result;
            } catch (error) {
                console.error('❌ Error minting attendance NFT:', error);

                let errorMessage = "Failed to mint NFT. Please try again.";

                if (error instanceof Error) {
                    if (error.message.includes('ENFTNotEnabled')) {
                        errorMessage = "NFT minting is not enabled for this event.";
                    } else if (error.message.includes('ENotRegistered')) {
                        errorMessage = "You are not registered for this event.";
                    } else if (error.message.includes('ENotCheckedIn')) {
                        errorMessage = "You must check in before minting the NFT.";
                    } else if (error.message.includes('EAlreadyMintedNFT')) {
                        errorMessage = "You have already minted your attendance NFT.";
                    } else if (error.message.includes('Insufficient gas')) {
                        errorMessage = "Insufficient gas to complete transaction.";
                    }
                }

                throw error;
            }
        },
        onSuccess: (data, variables) => {
            // Invalidate queries to refresh NFT status
            queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['attendees', variables.eventId] });
            queryClient.invalidateQueries({ queryKey: ['nfts'] });
        },
    });

    return {
        mintNFT: mutation.mutateAsync,
        isMinting: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
};

// Hook for admin to mint NFT on behalf of attendee
interface AdminMintNFTParams {
    eventId: string;
    attendeeAccountId: string;
}

export const useAdminMintNFT = () => {
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ eventId, attendeeAccountId }: AdminMintNFTParams) => {
            if (!account) {
                throw new Error('Wallet not connected');
            }

            try {
                const tx = new Transaction();

                tx.moveCall({
                    target: `${REGISTRY_PACKAGE_ID}::${HADATHA_MODULE}::admin_mint_nft_for_attendee`,
                    arguments: [
                        tx.object(eventId),
                        tx.pure.address(account.address), // This should be attendee address
                        tx.object(attendeeAccountId),
                        tx.object(CLOCK_ID),
                    ],
                });

                const result = await signAndExecuteTransaction({
                    transaction: tx,
                });

                console.log('✅ Admin minted NFT for attendee:', result);

                return result;
            } catch (error) {
                console.error('❌ Error minting NFT for attendee:', error);

                let errorMessage = "Failed to mint NFT for attendee.";

                if (error instanceof Error) {
                    if (error.message.includes('ENotOrganizer')) {
                        errorMessage = "Only organizers can mint NFTs for attendees.";
                    } else if (error.message.includes('ENFTNotEnabled')) {
                        errorMessage = "NFT minting is not enabled for this event.";
                    } else if (error.message.includes('ENotCheckedIn')) {
                        errorMessage = "Attendee must check in before minting NFT.";
                    } else if (error.message.includes('EAlreadyMintedNFT')) {
                        errorMessage = "This attendee has already minted their NFT.";
                    }
                }

                throw error;
            }
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['attendees', variables.eventId] });
        },
    });

    return {
        adminMintNFT: mutation.mutateAsync,
        isAdminMinting: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
};

// Hook to get user's attendance NFTs
export const useGetUserAttendanceNFTs = (userAddress?: string) => {
    // This would typically use a query to fetch NFTs owned by the user
    // You'll need to implement this based on your indexer or Sui client queries

    return {
        nfts: [],
        isLoading: false,
        error: null,
    };
};

// ============================================
// USAGE EXAMPLES
// ============================================

/*

// Example 1: User mints their own NFT
import { useMintAttendanceNFT } from "@/hooks/sui/useMintAttendanceNFT";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useGetDerivedAddress } from "@/hooks/sui/useCheckAccountExistence";

function MintNFTButton({ eventId }: { eventId: string }) {
    const { mintNFT, isMinting } = useMintAttendanceNFT();
    const currentAccount = useCurrentAccount();
    const derivedAddress = useGetDerivedAddress(currentAccount?.address);

    const handleMint = async () => {
        if (!derivedAddress) {
            alert("Account not found");
            return;
        }

        try {
            await mintNFT({
                eventId,
                accountId: derivedAddress,
            });
        } catch (error) {
            console.error("Minting failed:", error);
        }
    };

    return (
        <Button 
            onClick={handleMint} 
            disabled={isMinting}
            className="bg-purple-600 hover:bg-purple-700"
        >
            {isMinting ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Minting NFT...
                </>
            ) : (
                <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Mint Attendance NFT
                </>
            )}
        </Button>
    );
}

// Example 2: Mint NFT with conditions check
function ConditionalMintButton({ 
    eventId, 
    isCheckedIn, 
    hasNFT, 
    nftEnabled 
}: { 
    eventId: string, 
    isCheckedIn: boolean, 
    hasNFT: boolean,
    nftEnabled: boolean 
}) {
    const { mintNFT, isMinting } = useMintAttendanceNFT();
    const currentAccount = useCurrentAccount();
    const derivedAddress = useGetDerivedAddress(currentAccount?.address);

    const canMint = isCheckedIn && !hasNFT && nftEnabled;

    const handleMint = async () => {
        if (!derivedAddress || !canMint) return;

        try {
            await mintNFT({ eventId, accountId: derivedAddress });
        } catch (error) {
            console.error("Minting failed:", error);
        }
    };

    const getButtonText = () => {
        if (!nftEnabled) return "NFT Not Available";
        if (!isCheckedIn) return "Check In First";
        if (hasNFT) return "NFT Already Minted";
        if (isMinting) return "Minting...";
        return "Mint Attendance NFT";
    };

    return (
        <Button
            onClick={handleMint}
            disabled={!canMint || isMinting}
            className={`w-full ${
                hasNFT 
                    ? "bg-green-600/20 text-green-400 border-green-500/50" 
                    : "bg-purple-600 hover:bg-purple-700"
            }`}
        >
            {isMinting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {hasNFT && <CheckCircle className="w-4 h-4 mr-2" />}
            {getButtonText()}
        </Button>
    );
}

// Example 3: Mint NFT Modal
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function MintNFTModal({ 
    isOpen, 
    onClose, 
    eventId,
    eventTitle,
    nftImageUrl 
}: { 
    isOpen: boolean, 
    onClose: () => void, 
    eventId: string,
    eventTitle: string,
    nftImageUrl: string
}) {
    const { mintNFT, isMinting } = useMintAttendanceNFT();
    const currentAccount = useCurrentAccount();
    const derivedAddress = useGetDerivedAddress(currentAccount?.address);

    const handleMint = async () => {
        if (!derivedAddress) return;

        try {
            await mintNFT({ eventId, accountId: derivedAddress });
            onClose();
        } catch (error) {
            console.error("Minting failed:", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-black border-white/10 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle>Mint Attendance NFT</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                    <div className="aspect-square rounded-xl overflow-hidden border border-white/10">
                        <img 
                            src={nftImageUrl} 
                            alt="NFT Preview" 
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <h3 className="font-bold text-white mb-2">{eventTitle}</h3>
                        <p className="text-white/60 text-sm">
                            This NFT proves your attendance at this event. 
                            It will be stored in your wallet and can be viewed or traded.
                        </p>
                    </div>

                    <Button
                        onClick={handleMint}
                        disabled={isMinting}
                        className="w-full bg-purple-600 hover:bg-purple-700 py-6"
                    >
                        {isMinting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Minting Your NFT...
                            </>
                        ) : (
                            <>
                                <ImageIcon className="w-4 h-4 mr-2" />
                                Mint NFT
                            </>
                        )}
                    </Button>

                    <p className="text-center text-white/40 text-xs">
                        This action requires a small gas fee
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

*/