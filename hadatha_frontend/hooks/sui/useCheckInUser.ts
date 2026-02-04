import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation } from "@tanstack/react-query";
import { REGISTRY_PACKAGE_ID, HADATHA_MODULE, CLOCK_ID } from "@/lib/constant";

export const useCheckInUser = () => {
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    const mutation = useMutation({
        mutationFn: async ({ event, attendee, account: accountId }: { event: string, attendee: string, account: string | null }) => {
            if (!account) {
                throw new Error('Wallet not connected');
            }

            try {
                const tx = new Transaction();

                if (accountId) {
                    tx.moveCall({
                        target: `${REGISTRY_PACKAGE_ID}::${HADATHA_MODULE}::checkin_event`,
                        arguments: [
                            tx.object(event),
                            tx.pure.address(attendee),
                            tx.object(accountId),
                            tx.object(CLOCK_ID),
                        ],
                    });
                } else {
                    tx.moveCall({
                        target: `${REGISTRY_PACKAGE_ID}::${HADATHA_MODULE}::checkin_event_guest`,
                        arguments: [
                            tx.object(event),
                            tx.pure.address(attendee),
                            tx.object(CLOCK_ID),
                        ],
                    });
                }

                const result = await signAndExecuteTransaction({
                    transaction: tx,
                });

                console.log('✅ User checked in successfully:', result);
                return result;
            } catch (error) {
                console.error('❌ Error checking in user:', error);
                throw error;
            }
        },
    });

    return {
        checkInUser: mutation.mutateAsync,
        isCheckingIn: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
};
