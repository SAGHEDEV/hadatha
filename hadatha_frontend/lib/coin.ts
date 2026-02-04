import { SUI_TYPE, USDC_TYPE } from "./constant";

export const getCurrencyLabel = (type: string) => {
    if (type === USDC_TYPE) return "USDC";
    if (type === SUI_TYPE || !type) return "SUI";
    // Handle short names if they come from form/preview
    if (type === "USDC") return "USDC";
    if (type === "SUI") return "SUI";

    // Extract last part of type string (e.g. 0x...::SUI -> SUI)
    const parts = type.split('::');
    return parts[parts.length - 1] || "SUI";
};

export const getFullCurrencyType = (type: string) => {
    if (type === "USDC") return USDC_TYPE;
    if (type === "SUI") return SUI_TYPE;
    return type || SUI_TYPE;
};

export const formatAmount = (amount: string | number, decimals: number = 9) => {
    const num = Number(amount) / Math.pow(10, decimals);
    return num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
    });
};
