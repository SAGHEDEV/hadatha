import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { REGISTRY_PACKAGE_ID, HADATHA_MODULE, CLOCK_ID } from "@/lib/constant";

interface SetupNFTParams {
    eventId: string;
    nftName: string;
    nftDescription: string;
    nftImageUrl: string;
}

export const useSetupAttendanceNFT = () => {
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ eventId, nftName, nftDescription, nftImageUrl }: SetupNFTParams) => {
            if (!account) {
                throw new Error('Wallet not connected');
            }

            try {
                const tx = new Transaction();

                // Convert strings to vector<u8> format
                tx.moveCall({
                    target: `${REGISTRY_PACKAGE_ID}::${HADATHA_MODULE}::enable_nft_collection`,
                    arguments: [
                        tx.object(eventId),
                        tx.pure.string(nftName),
                        tx.pure.string(nftDescription),
                        tx.pure.string(nftImageUrl),
                        tx.object(CLOCK_ID),
                    ],
                });

                const result = await signAndExecuteTransaction({
                    transaction: tx,
                });

                console.log('✅ NFT Collection enabled successfully:', result);

                return result;
            } catch (error) {
                console.error('❌ Error enabling NFT collection:', error);

                // Parse error for better user feedback
                let errorMessage = "Failed to enable NFT collection. Please try again.";

                if (error instanceof Error) {
                    if (error.message.includes('ENotOrganizer')) {
                        errorMessage = "Only organizers can enable NFT collection.";
                    } else if (error.message.includes('Insufficient gas')) {
                        errorMessage = "Insufficient gas to complete transaction.";
                    }
                }

                throw error;
            }
        },
        onSuccess: (data, variables) => {
            // Invalidate and refetch event queries to get updated NFT config
            queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });

    return {
        setupNFT: mutation.mutateAsync,
        isSettingUp: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
};

// Hook to update existing NFT collection
export const useUpdateNFTCollection = () => {
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ eventId, nftName, nftDescription, nftImageUrl }: SetupNFTParams) => {
            if (!account) {
                throw new Error('Wallet not connected');
            }

            try {
                const tx = new Transaction();

                tx.moveCall({
                    target: `${REGISTRY_PACKAGE_ID}::${HADATHA_MODULE}::update_nft_collection`,
                    arguments: [
                        tx.object(eventId),
                        tx.pure.string(nftName),
                        tx.pure.string(nftDescription),
                        tx.pure.string(nftImageUrl),
                        tx.object(CLOCK_ID),
                    ],
                });

                const result = await signAndExecuteTransaction({
                    transaction: tx,
                });

                console.log('✅ NFT Collection updated successfully:', result);

                return result;
            } catch (error) {
                console.error('❌ Error updating NFT collection:', error);
                throw error;
            }
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });

    return {
        updateNFT: mutation.mutateAsync,
        isUpdating: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
};

// Hook to disable NFT collection
export const useDisableNFTCollection = () => {
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (eventId: string) => {
            if (!account) {
                throw new Error('Wallet not connected');
            }

            try {
                const tx = new Transaction();

                tx.moveCall({
                    target: `${REGISTRY_PACKAGE_ID}::${HADATHA_MODULE}::disable_nft_collection`,
                    arguments: [
                        tx.object(eventId),
                        tx.object(CLOCK_ID),
                    ],
                });

                const result = await signAndExecuteTransaction({
                    transaction: tx,
                });

                console.log('✅ NFT Collection disabled successfully:', result);

                return result;
            } catch (error) {
                console.error('❌ Error disabling NFT collection:', error);
                throw error;
            }
        },
        onSuccess: (data, eventId) => {
            queryClient.invalidateQueries({ queryKey: ['event', eventId] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });

    return {
        disableNFT: mutation.mutateAsync,
        isDisabling: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
};