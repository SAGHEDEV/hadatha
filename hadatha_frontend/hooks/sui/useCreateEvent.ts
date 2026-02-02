import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation } from "@tanstack/react-query";
import { REGISTRY_PACKAGE_ID, HADATHA_MODULE, EVENT_REGISTRY_ID, CLOCK_ID } from "@/lib/constant";
import { useGetDerivedAddress } from "./useCheckAccountExistence";

interface CreateEventParams {
    account: string; // Account object ID
    title: string;
    description: string;
    location: string;
    startTime: number;
    endTime: number;
    imageUrl: string;
    registrationFieldNames: string[];
    registrationFieldTypes: string[];
    organizers: string[];
    maxAttendees: number;
    tags: string[];
    tierNames: string[];
    tierPrices: string[];
}

export const useCreateEvent = () => {
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const derivedAddress = useGetDerivedAddress(account?.address)

    const mutation = useMutation({
        mutationFn: async (params: CreateEventParams) => {
            if (!account) {
                throw new Error('Wallet not connected');
            }

            try {
                const tx = new Transaction();

                tx.moveCall({
                    target: `${REGISTRY_PACKAGE_ID}::${HADATHA_MODULE}::create_event`,
                    arguments: [
                        tx.object(EVENT_REGISTRY_ID),
                        tx.object(derivedAddress!),
                        tx.pure.string(params.title),
                        tx.pure.string(params.description),
                        tx.pure.string(params.location),
                        tx.pure.u64(params.startTime),
                        tx.pure.u64(params.endTime),
                        tx.pure.string(params.imageUrl),
                        tx.pure.vector("string", params.registrationFieldNames),
                        tx.pure.vector("string", params.registrationFieldTypes),
                        tx.pure.vector("address", params.organizers),
                        tx.pure.u64(params.maxAttendees),
                        tx.pure.vector("string", params.tags),
                        tx.pure.vector("string", params.tierNames),
                        tx.pure.vector("u64", params.tierPrices),
                        tx.object(CLOCK_ID),
                    ],
                });

                const result = await signAndExecuteTransaction({
                    transaction: tx,
                });

                console.log('✅ Event created successfully:', result);
                return result;
            } catch (error) {
                console.error('❌ Error creating event:', error);
                throw error;
            }
        },
    });

    return {
        createEvent: mutation.mutateAsync,
        isCreating: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
};
