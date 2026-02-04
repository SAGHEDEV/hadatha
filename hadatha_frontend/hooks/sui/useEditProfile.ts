import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation } from "@tanstack/react-query";
import { REGISTRY_PACKAGE_ID, HADATHA_MODULE } from "@/lib/constant";

export interface EditProfileParams {
    accountId: string; // The object ID of the Account object
    name: string;
    email: string;
    bio: string;
    twitter: string;
    github: string;
    website: string;
    imageUrl: string;
}

export const useEditProfile = () => {
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    const mutation = useMutation({
        mutationFn: async ({ accountId, name, email, bio, twitter, github, website, imageUrl }: EditProfileParams) => {
            if (!account) {
                throw new Error('Wallet not connected');
            }

            try {
                const tx = new Transaction();

                tx.moveCall({
                    target: `${REGISTRY_PACKAGE_ID}::${HADATHA_MODULE}::edit_profile`,
                    arguments: [
                        tx.object(accountId),
                        tx.pure.vector("u8", Array.from(new TextEncoder().encode(name))),
                        tx.pure.vector("u8", Array.from(new TextEncoder().encode(email))),
                        tx.pure.vector("u8", Array.from(new TextEncoder().encode(bio))),
                        tx.pure.vector("u8", Array.from(new TextEncoder().encode(twitter))),
                        tx.pure.vector("u8", Array.from(new TextEncoder().encode(github))),
                        tx.pure.vector("u8", Array.from(new TextEncoder().encode(website))),
                        tx.pure.vector("u8", Array.from(new TextEncoder().encode(imageUrl))),
                    ],
                });

                const result = await signAndExecuteTransaction({
                    transaction: tx,
                });

                console.log('✅ Profile updated successfully:', result);
                return result;
            } catch (error) {
                console.error('❌ Error editing profile:', error);
                throw error;
            }
        },
    });

    return {
        editProfile: mutation.mutateAsync,
        isUpdating: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
};
