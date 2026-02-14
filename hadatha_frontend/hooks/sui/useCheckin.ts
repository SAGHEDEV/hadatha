import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { REGISTRY_PACKAGE_ID, EVENTS_MODULE, CLOCK_ID } from "@/lib/constant";

// Hook to toggle check-in allowance (organizers only)
export const useToggleAllowCheckin = () => {
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
                    target: `${REGISTRY_PACKAGE_ID}::${EVENTS_MODULE}::toggle_allow_checkin`,
                    arguments: [
                        tx.object(eventId),
                        tx.object(CLOCK_ID),
                    ],
                });
                // ... (trimmed for brevity, will use full content in tool call)

                const result = await signAndExecuteTransaction({
                    transaction: tx,
                });

                console.log('✅ Check-in allowance toggled successfully:', result);

                return result;
            } catch (error) {
                console.error('❌ Error toggling check-in allowance:', error);
                throw error;
            }
        },
        onSuccess: (data, eventId) => {
            // Invalidate event queries to refresh check-in status
            queryClient.invalidateQueries({ queryKey: ['event', eventId] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });

    return {
        toggleAllowCheckin: mutation.mutateAsync,
        isToggling: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
};

// Hook for self check-in or admin check-in
interface CheckInParams {
    eventId: string;
    attendeeAddress: string;
    accountId?: string | null;
}

export const useCheckIn = () => {
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ eventId, attendeeAddress, accountId }: CheckInParams) => {
            if (!account) {
                throw new Error('Wallet not connected');
            }

            try {
                const tx = new Transaction();

                if (accountId) {
                    tx.moveCall({
                        target: `${REGISTRY_PACKAGE_ID}::${EVENTS_MODULE}::checkin_event`,
                        arguments: [
                            tx.object(eventId),
                            tx.pure.address(attendeeAddress),
                            tx.object(accountId),
                            tx.object(CLOCK_ID),
                        ],
                    });
                } else {
                    tx.moveCall({
                        target: `${REGISTRY_PACKAGE_ID}::${EVENTS_MODULE}::checkin_event_guest`,
                        arguments: [
                            tx.object(eventId),
                            tx.pure.address(attendeeAddress),
                            tx.object(CLOCK_ID),
                        ],
                    });
                }

                const result = await signAndExecuteTransaction({
                    transaction: tx,
                });

                console.log('✅ Check-in successful:', result);

                return result;
            } catch (error) {
                console.error('❌ Error during check-in:', error);
                throw error;
            }
        },
        onSuccess: (data, variables) => {
            // Invalidate queries to refresh attendee list and event data
            queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['attendees', variables.eventId] });
        },
    });

    return {
        checkIn: mutation.mutateAsync,
        isCheckingIn: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
};

// Hook for bulk check-in (organizers checking in multiple attendees)
interface BulkCheckInParams {
    eventId: string;
    attendees: Array<{
        address: string;
        accountId?: string | null;
    }>;
}

export const useBulkCheckIn = () => {
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ eventId, attendees }: BulkCheckInParams) => {
            if (!account) {
                throw new Error('Wallet not connected');
            }

            try {
                const tx = new Transaction();

                // Add multiple check-in calls to the same transaction
                attendees.forEach(({ address, accountId }) => {
                    if (accountId) {
                        tx.moveCall({
                            target: `${REGISTRY_PACKAGE_ID}::${EVENTS_MODULE}::checkin_event`,
                            arguments: [
                                tx.object(eventId),
                                tx.pure.address(address),
                                tx.object(accountId),
                                tx.object(CLOCK_ID),
                            ],
                        });
                    } else {
                        tx.moveCall({
                            target: `${REGISTRY_PACKAGE_ID}::${EVENTS_MODULE}::checkin_event_guest`,
                            arguments: [
                                tx.object(eventId),
                                tx.pure.address(address),
                                tx.object(CLOCK_ID),
                            ],
                        });
                    }
                });

                const result = await signAndExecuteTransaction({
                    transaction: tx,
                });

                console.log('✅ Bulk check-in successful:', result);

                return result;
            } catch (error) {
                console.error('❌ Error during bulk check-in:', error);
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
        bulkCheckIn: mutation.mutateAsync,
        isBulkCheckingIn: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
};