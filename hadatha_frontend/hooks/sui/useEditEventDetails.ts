import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation } from "@tanstack/react-query";
import { REGISTRY_PACKAGE_ID, HADATHA_MODULE, CLOCK_ID } from "@/lib/constant";

interface EditEventParams {
    event: string; // Event object ID
    title: string;
    description: string;
    location: string;
    startTime: number;
    endTime: number;
    imageUrl: string;
    maxAttendees: number;
    tags: string[];
    price: string;
}

export const useEditEventDetails = () => {
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    const mutation = useMutation({
        mutationFn: async (params: EditEventParams) => {
            if (!account) {
                throw new Error('Wallet not connected');
            }

            try {
                const tx = new Transaction();

                tx.moveCall({
                    target: `${REGISTRY_PACKAGE_ID}::${HADATHA_MODULE}::edit_event`,
                    arguments: [
                        tx.object(params.event),
                        tx.pure.string(params.title),
                        tx.pure.string(params.description),
                        tx.pure.string(params.location),
                        tx.pure.u64(params.startTime),
                        tx.pure.u64(params.endTime),
                        tx.pure.string(params.imageUrl),
                        tx.pure.u64(params.maxAttendees),
                        tx.pure.vector("string", params.tags),
                        tx.pure.string(params.price),
                        tx.object(CLOCK_ID),
                    ],
                });

                const result = await signAndExecuteTransaction({
                    transaction: tx,
                });

                console.log('✅ Event details edited successfully:', result);
                return result;
            } catch (error) {
                console.error('❌ Error editing event details:', error);
                throw error;
            }
        },
    });

    return {
        editEventDetails: mutation.mutateAsync,
        isEditing: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
};
