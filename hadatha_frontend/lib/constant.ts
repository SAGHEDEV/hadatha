export const REGISTRY_PACKAGE_ID = process.env.NEXT_PUBLIC_REGISTRY_PACKAGE_ID || process.env.REGISTRY_PACKAGE_ID || "0x0";
export const HADATHA_MODULE = "hadatha_contract";
export const ACCOUNT_ROOT_ID = process.env.NEXT_PUBLIC_ACCOUNT_ROOT_ID || process.env.ACCOUNT_ROOT_ID || "0x0";
export const EVENT_REGISTRY_ID = process.env.NEXT_PUBLIC_EVENT_REGISTRY_ID || process.env.EVENT_REGISTRY_ID || "0x0";
export const CLOCK_ID = "0x6"; // Standard Sui Clock ID
export const SUI_TYPE = "0000000000000000000000000000000000000000000000000000000000000002::sui::SUI";
export const USDC_TYPE = process.env.NEXT_PUBLIC_USDC_TYPE || "0000000000000000000000000000000000000000000000000123456789::usdc::USDC"; // Replace with real package ID if needed