import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation } from "@tanstack/react-query";
import { REGISTRY_PACKAGE_ID, HADATHA_MODULE } from "@/lib/constant";

export const useEditProfile = () => {
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    const mutation = useMutation({
        mutationFn: async ({ account: accountId, name, email }: { account: string, name: string, email: string }) => {
            if (!account) {
                throw new Error('Wallet not connected');
            }

            try {
                const tx = new Transaction();

                tx.moveCall({
                    target: `${REGISTRY_PACKAGE_ID}::${HADATHA_MODULE}::edit_profile`,
                    arguments: [
                        tx.object(accountId),
                        tx.pure.string(name),
                        tx.pure.string(email),
                    ],
                });

                const result = await signAndExecuteTransaction({
                    transaction: tx,
                });

                console.log('✅ Profile edited successfully:', result);
                return result;
            } catch (error) {
                console.error('❌ Error editing profile:', error);
                throw error;
            }
        },
    });

    return {
        editProfile: mutation.mutateAsync,
        isEditing: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
};
