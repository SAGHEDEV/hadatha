import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation } from "@tanstack/react-query";
import { REGISTRY_PACKAGE_ID, EVENTS_MODULE, CLOCK_ID } from "@/lib/constant";

interface EditEventParams {
    id: string; // Account object ID
    title: string;
    description: string;
    location: string;
    isVirtual: boolean;
    link: string;
    linkType: string;
    isAnonymous: boolean;
    startTime: number;
    endTime: number;
    imageUrl: string;
    event_hex: string;
    registrationFieldNames: string[];
    registrationFieldTypes: string[];
    organizers: string[];
    maxAttendees: number;
    tags: string[];
    tierNames: string[];
    tierPrices: number[];
    tierCurrencies: string[];
    tierCapacities: number[];
}

export const useEditEvent = () => {
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
                    target: `${REGISTRY_PACKAGE_ID}::${EVENTS_MODULE}::edit_event`,
                    arguments: [
                        tx.object(params.id!),
                        tx.pure.string(params.title),
                        tx.pure.string(params.description),
                        tx.pure.string(params.location),
                        tx.pure.bool(params.isVirtual),
                        tx.pure.string(params.link),
                        tx.pure.string(params.linkType),
                        tx.pure.bool(params.isAnonymous),
                        tx.pure.u64(params.startTime),
                        tx.pure.u64(params.endTime),
                        tx.pure.string(params.imageUrl),
                        tx.pure.string(params.event_hex),
                        tx.pure.u64(params.maxAttendees),
                        tx.pure.vector("string", params.registrationFieldNames),
                        tx.pure.vector("string", params.registrationFieldTypes),
                        tx.pure.vector("string", params.tags),
                        tx.pure.vector("string", params.tierNames),
                        tx.pure.vector("u64", params.tierPrices),
                        tx.pure.vector("string", params.tierCurrencies),
                        tx.pure.vector("u64", params.tierCapacities),
                        tx.pure.vector("address", params.organizers),
                        tx.object(CLOCK_ID),
                    ],
                });

                const result = await signAndExecuteTransaction({
                    transaction: tx,
                });

                console.log('✅ Event edited successfully:', result);
                return result;
            } catch (error) {
                console.error('❌ Error editing event:', error);
                throw error;
            }
        },
    });

    return {
        editEvent: mutation.mutateAsync,
        isEditing: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
};
