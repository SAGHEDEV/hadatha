import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation } from "@tanstack/react-query";
import { REGISTRY_PACKAGE_ID, PROFILE_MODULE, ACCOUNT_ROOT_ID } from "@/lib/constant";

export interface CreateAccountParams {
    name: string;
    email: string;
    bio?: string;
    twitter?: string;
    github?: string;
    website?: string;
    imageUrl: string;
}

export const useCreateAccount = () => {
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    const mutation = useMutation({
        mutationFn: async ({ name, email, bio, twitter, github, website, imageUrl }: CreateAccountParams) => {
            if (!account) {
                throw new Error('Wallet not connected');
            }

            try {
                const tx = new Transaction();

                tx.moveCall({
                    target: `${REGISTRY_PACKAGE_ID}::${PROFILE_MODULE}::create_account`,
                    arguments: [
                        tx.object(ACCOUNT_ROOT_ID),
                        tx.pure.vector("u8", Array.from(new TextEncoder().encode(name))),
                        tx.pure.vector("u8", Array.from(new TextEncoder().encode(email))),
                        tx.pure.vector("u8", Array.from(new TextEncoder().encode(bio || ""))),
                        tx.pure.vector("u8", Array.from(new TextEncoder().encode(twitter || ""))),
                        tx.pure.vector("u8", Array.from(new TextEncoder().encode(github || ""))),
                        tx.pure.vector("u8", Array.from(new TextEncoder().encode(website || ""))),
                        tx.pure.vector("u8", Array.from(new TextEncoder().encode(imageUrl))),
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
    });

    return {
        createAccount: mutation.mutateAsync,
        isCreating: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
};
