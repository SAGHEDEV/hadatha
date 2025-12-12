import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { REGISTRY_PACKAGE_ID, HADATHA_MODULE, CLOCK_ID } from "@/lib/constant";

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
                    target: `${REGISTRY_PACKAGE_ID}::${HADATHA_MODULE}::toggle_allow_checkin`,
                    arguments: [
                        tx.object(eventId),
                        tx.object(CLOCK_ID),
                    ],
                });

                const result = await signAndExecuteTransaction({
                    transaction: tx,
                });

                console.log('✅ Check-in allowance toggled successfully:', result);

                return result;
            } catch (error) {
                console.error('❌ Error toggling check-in allowance:', error);

                let errorMessage = "Failed to update check-in settings. Please try again.";

                if (error instanceof Error) {
                    if (error.message.includes('ENotOrganizer')) {
                        errorMessage = "Only organizers can change check-in settings.";
                    } else if (error.message.includes('Insufficient gas')) {
                        errorMessage = "Insufficient gas to complete transaction.";
                    }
                }

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
    accountId: string;
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

                tx.moveCall({
                    target: `${REGISTRY_PACKAGE_ID}::${HADATHA_MODULE}::checkin_event`,
                    arguments: [
                        tx.object(eventId),
                        tx.pure.address(attendeeAddress),
                        tx.object(accountId),
                        tx.object(CLOCK_ID),
                    ],
                });

                const result = await signAndExecuteTransaction({
                    transaction: tx,
                });

                console.log('✅ Check-in successful:', result);

                const isSelfCheckIn = account.address === attendeeAddress;


                return result;
            } catch (error) {
                console.error('❌ Error during check-in:', error);

                let errorMessage = "Failed to check in. Please try again.";

                if (error instanceof Error) {
                    if (error.message.includes('ECheckinNotAllowed')) {
                        errorMessage = "Check-in is not currently allowed for this event.";
                    } else if (error.message.includes('ENotRegistered')) {
                        errorMessage = "This attendee is not registered for the event.";
                    } else if (error.message.includes('EAlreadyCheckedIn')) {
                        errorMessage = "This attendee has already checked in.";
                    } else if (error.message.includes('ENotOrganizer')) {
                        errorMessage = "You don't have permission to check in this attendee.";
                    } else if (error.message.includes('Insufficient gas')) {
                        errorMessage = "Insufficient gas to complete transaction.";
                    }
                }

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
        accountId: string;
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
                    tx.moveCall({
                        target: `${REGISTRY_PACKAGE_ID}::${HADATHA_MODULE}::checkin_event`,
                        arguments: [
                            tx.object(eventId),
                            tx.pure.address(address),
                            tx.object(accountId),
                            tx.object(CLOCK_ID),
                        ],
                    });
                });

                const result = await signAndExecuteTransaction({
                    transaction: tx,
                });

                console.log('✅ Bulk check-in successful:', result);

                return result;
            } catch (error) {
                console.error('❌ Error during bulk check-in:', error);

                let errorMessage = "Failed to check in attendees. Please try again.";

                if (error instanceof Error) {
                    if (error.message.includes('ENotOrganizer')) {
                        errorMessage = "Only organizers can perform bulk check-in.";
                    } else if (error.message.includes('ECheckinNotAllowed')) {
                        errorMessage = "Check-in is not currently allowed for this event.";
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
        bulkCheckIn: mutation.mutateAsync,
        isBulkCheckingIn: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
};