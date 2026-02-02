import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation } from "@tanstack/react-query";
import { REGISTRY_PACKAGE_ID, HADATHA_MODULE, CLOCK_ID } from "@/lib/constant";

export const useRegisterUser = () => {
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    const mutation = useMutation({
        mutationFn: async ({ event, account: accountId, registrationValues, tierIndex, price }: { event: string, account: string, registrationValues: string[], tierIndex: number, price: number }) => {
            if (!account) {
                throw new Error('Wallet not connected');
            }

            try {
                const tx = new Transaction();

                // Split Coin for Payment (Price in MIST)
                const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(price)]);

                tx.moveCall({
                    target: `${REGISTRY_PACKAGE_ID}::${HADATHA_MODULE}::register_for_event`,
                    arguments: [
                        tx.object(event),
                        tx.object(accountId),
                        tx.pure.vector("string", registrationValues),
                        tx.pure.u64(tierIndex),
                        payment,
                        tx.object(CLOCK_ID),
                    ],
                });

                const result = await signAndExecuteTransaction({
                    transaction: tx,
                });

                console.log('✅ User registered successfully:', result);
                return result;
            } catch (error) {
                console.error('❌ Error registering user:', error);
                throw error;
            }
        },
    });

    return {
        registerUser: mutation.mutateAsync,
        isRegistering: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
};
