import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { normalizeStructTag } from "@mysten/sui/utils";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation } from "@tanstack/react-query";
import { REGISTRY_PACKAGE_ID, EVENTS_MODULE, CLOCK_ID, SUI_TYPE } from "@/lib/constant";

export const useRegisterUser = () => {
    const account = useCurrentAccount();
    const suiClient = useSuiClient();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    const mutation = useMutation({
        mutationFn: async ({ event, account: accountId, registrationValues, tierIndex, price, currency }: { event: string, account: string | null, registrationValues: string[], tierIndex: number, price: number, currency: string }) => {
            if (!account) {
                throw new Error('Wallet not connected');
            }

            try {
                const tx = new Transaction();
                let payment;

                if (normalizeStructTag(currency) === normalizeStructTag(SUI_TYPE)) {
                    // Split Coin for Payment (Price in MIST)
                    [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(price)]);
                } else {
                    // Handle non-SUI coins (e.g. USDC)
                    const coins = await suiClient.getCoins({
                        owner: account.address,
                        coinType: currency
                    });

                    if (coins.data.length === 0) {
                        throw new Error(`No coins of type ${currency} found in wallet`);
                    }

                    // For simplicity, take the first coin or merge if multiple are needed.
                    const coinIds = coins.data.map(c => c.coinObjectId);
                    const primaryCoin = coinIds[0];
                    if (coinIds.length > 1) {
                        tx.mergeCoins(tx.object(primaryCoin), coinIds.slice(1).map(id => tx.object(id)));
                    }
                    [payment] = tx.splitCoins(tx.object(primaryCoin), [tx.pure.u64(price)]);
                }

                if (accountId) {
                    tx.moveCall({
                        target: `${REGISTRY_PACKAGE_ID}::${EVENTS_MODULE}::register_for_event`,
                        typeArguments: [currency],
                        arguments: [
                            tx.object(event),
                            tx.object(accountId),
                            tx.pure.vector("string", registrationValues),
                            tx.pure.u64(tierIndex),
                            payment,
                            tx.object(CLOCK_ID),
                        ],
                    });
                } else {
                    tx.moveCall({
                        target: `${REGISTRY_PACKAGE_ID}::${EVENTS_MODULE}::register_for_event_guest`,
                        typeArguments: [currency],
                        arguments: [
                            tx.object(event),
                            tx.pure.vector("string", registrationValues),
                            tx.pure.u64(tierIndex),
                            payment,
                            tx.object(CLOCK_ID),
                        ],
                    });
                }
                tx.setGasBudget(1000000000);

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
