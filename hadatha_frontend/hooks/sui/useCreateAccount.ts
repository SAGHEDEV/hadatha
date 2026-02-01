import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { REGISTRY_PACKAGE_ID, HADATHA_MODULE, ACCOUNT_ROOT_ID } from "@/lib/constant";

export const useCreateAccount = () => {
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ name, email, image_url }: { name: string, email: string, image_url: string }) => {
            if (!account) {
                throw new Error('Wallet not connected');
            }

            try {
                const tx = new Transaction();

                tx.moveCall({
                    target: `${REGISTRY_PACKAGE_ID}::${HADATHA_MODULE}::create_account`,
                    arguments: [
                        tx.object(ACCOUNT_ROOT_ID),
                        tx.pure.string(name),
                        tx.pure.string(email),
                        tx.pure.string(image_url),
                    ],
                });

                const result = await signAndExecuteTransaction({
                    transaction: tx,
                });

                console.log('✅ Account created successfully:', result);
                return result;
            } catch (error) {
                console.error('❌ Error creating account:', error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries();
        }
    });

    return {
        createAccount: mutation.mutateAsync,
        isCreating: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
};
