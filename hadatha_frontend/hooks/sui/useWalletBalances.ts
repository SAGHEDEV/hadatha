import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { SUI_TYPE, USDC_TYPE } from "@/lib/constant";
import { CoinBalance } from "@mysten/sui/client";

export const useWalletBalances = () => {
    const account = useCurrentAccount();

    const { data: balances, isLoading, refetch } = useSuiClientQuery('getAllBalances', {
        owner: account?.address || "",
    }, {
        enabled: !!account?.address,
        refetchInterval: 10000,
    });

    const getBalance = (type: string) => {
        const b = (balances as CoinBalance[] | undefined)?.find((b) => b.coinType === type);
        return b ? BigInt(b.totalBalance) : BigInt(0);
    };

    const formatBalance = (balance: bigint, decimals: number = 9) => {
        return (Number(balance) / Math.pow(10, decimals)).toFixed(2);
    };

    return {
        balances: {
            sui: getBalance(SUI_TYPE),
            usdc: getBalance(USDC_TYPE),
        },
        formattedBalances: {
            sui: formatBalance(getBalance(SUI_TYPE), 9),
            usdc: formatBalance(getBalance(USDC_TYPE), 9),
        },
        isLoading,
        refetch,
    };
};
