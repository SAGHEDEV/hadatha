import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation } from "@tanstack/react-query";
import { REGISTRY_PACKAGE_ID, EVENTS_MODULE, CLOCK_ID } from "@/lib/constant";

export const useCreateAdminNFT = () => {
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    const mutation = useMutation({
        mutationFn: async ({ event, attendee, attendeeAccount }: { event: string, attendee: string, attendeeAccount: string }) => {
            if (!account) {
                throw new Error('Wallet not connected');
            }

            try {
                const tx = new Transaction();

                tx.moveCall({
                    target: `${REGISTRY_PACKAGE_ID}::${EVENTS_MODULE}::admin_mint_nft_for_attendee`,
                    arguments: [
                        tx.object(event),
                        tx.pure.address(attendee),
                        tx.object(attendeeAccount),
                        tx.object(CLOCK_ID),
                    ],
                });

                const result = await signAndExecuteTransaction({
                    transaction: tx,
                });

                console.log('✅ Admin NFT created successfully:', result);
                return result;
            } catch (error) {
                console.error('❌ Error creating Admin NFT:', error);
                throw error;
            }
        },
    });

    return {
        createAdminNFT: mutation.mutateAsync,
        isCreating: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
};
