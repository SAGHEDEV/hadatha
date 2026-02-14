/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { REGISTRY_PACKAGE_ID, PROFILE_MODULE } from "@/lib/constant";

export interface AccountDetails {
    id: string;
    address: string;
    name: string;
    email: string;
    image_url: string;
    total_attended: number;
    total_organized: number;
    total_hosted: number;
    total_registered: number;
}

// Helper function to convert vector<u8> to string
const bytesToString = (bytes: number[]): string => {
    return new TextDecoder().decode(new Uint8Array(bytes));
};

// Parse account data from Move object fields
const parseAccountData = (fields: any): Omit<AccountDetails, 'id' | 'address'> => {
    return {
        name: bytesToString(fields.name),
        email: bytesToString(fields.email),
        image_url: bytesToString(fields.image_url),
        total_attended: Number(fields.total_attended),
        total_organized: Number(fields.total_organized),
        total_hosted: Number(fields.total_hosted),
        total_registered: Number(fields.total_registered),
    };
};

// Get all AccountCreated events
export const useGetAllAccountCreatedEvents = () => {
    return useSuiClientQuery("queryEvents", {
        query: {
            MoveEventType: `${REGISTRY_PACKAGE_ID}::${PROFILE_MODULE}::AccountCreated`
        },
        order: "descending"
    });
};

// Extract account info from AccountCreated events
const useGetAccountIdsAndAddresses = () => {
    const { data, isLoading, error } = useGetAllAccountCreatedEvents();

    const accountData = data?.data.map((event) => {
        const parsedJson = event.parsedJson as {
            account_id: string;
            owner: string;
            name: number[];
        };
        return {
            accountId: parsedJson.account_id,
            ownerAddress: parsedJson.owner,
            name: bytesToString(parsedJson.name),
        };
    }) || [];

    return { accountData, isLoading, error };
};

// Method 1: Get all accounts by querying events then fetching objects
export const useGetAllAccounts = () => {
    const { accountData, isLoading: idsLoading } = useGetAccountIdsAndAddresses();

    const accountIds = accountData.map(acc => acc.accountId);

    const { data: accountObjects, isLoading, error } = useSuiClientQuery(
        "multiGetObjects",
        {
            ids: accountIds,
            options: {
                showContent: true,
                showOwner: true,
            }
        },
        {
            enabled: accountIds.length > 0,
        }
    );

    if (idsLoading || isLoading) {
        return { accounts: [], isLoading: true, error: null };
    }

    if (error) {
        return { accounts: [], isLoading: false, error };
    }

    if (!accountObjects) {
        return { accounts: [], isLoading: false, error: null };
    }

    // Parse the account details
    const accounts: AccountDetails[] = accountObjects
        .filter((obj) => obj.data?.content?.dataType === "moveObject")
        .map((obj, index) => {
            const content = obj.data?.content as any;
            const fields = content.fields;

            const parsedAccount = parseAccountData(fields);

            return {
                id: fields.id.id,
                address: accountData[index].ownerAddress,
                ...parsedAccount,
            };
        });

    return { accounts, isLoading: false, error: null };
};

// Method 2: Get accounts owned by specific address
export const useGetAccountsByOwner = (ownerAddress: string) => {
    const { data, isLoading, error } = useSuiClientQuery(
        "getOwnedObjects",
        {
            owner: ownerAddress,
            filter: {
                StructType: `${REGISTRY_PACKAGE_ID}::${PROFILE_MODULE}::Account`
            },
            options: {
                showContent: true,
                showOwner: true,
            }
        },
        {
            enabled: !!ownerAddress,
        }
    );

    if (isLoading || !data) {
        return { accounts: [], isLoading, error };
    }

    const accounts: AccountDetails[] = data.data
        .filter((obj) => obj.data?.content?.dataType === "moveObject")
        .map((obj) => {
            const content = obj.data?.content as any;
            const fields = content.fields;

            const parsedAccount = parseAccountData(fields);

            return {
                id: fields.id.id,
                address: ownerAddress,
                ...parsedAccount,
            };
        });

    return { accounts, isLoading: false, error: null };
};

// Method 3: Get single account by ID
export const useGetAccountById = (accountId: string) => {
    const { data, isLoading, error } = useSuiClientQuery(
        "getObject",
        {
            id: accountId,
            options: {
                showContent: true,
                showOwner: true,
            }
        },
        {
            enabled: !!accountId,
        }
    );

    if (isLoading || !data) {
        return { account: null, isLoading, error };
    }

    if (data.data?.content?.dataType !== "moveObject") {
        return { account: null, isLoading: false, error: new Error("Invalid object type") };
    }

    const content = data.data.content as any;
    const fields = content.fields;
    const owner = data.data.owner as any;

    const parsedAccount = parseAccountData(fields);

    const account: AccountDetails = {
        id: fields.id.id,
        address: owner?.AddressOwner || "",
        ...parsedAccount,
    };

    return { account, isLoading: false, error: null };
};

// Method 4: Check if user has an account (using derived object ID)
export const useCheckUserHasAccount = (userAddress: string) => {
    // Since accounts use derived objects, we can compute the expected ID
    // and check if it exists
    const { accounts, isLoading } = useGetAccountsByOwner(userAddress);

    return {
        hasAccount: accounts.length > 0,
        account: accounts[0] || null,
        isLoading,
    };
};

// Method 5: Get account stats aggregation
export const useGetAccountStats = () => {
    const { accounts, isLoading, error } = useGetAllAccounts();

    if (isLoading || error) {
        return {
            totalAccounts: 0,
            totalEventsOrganized: 0,
            totalEventsAttended: 0,
            totalRegistrations: 0,
            isLoading,
            error,
        };
    }

    const stats = accounts.reduce(
        (acc, account) => ({
            totalAccounts: acc.totalAccounts + 1,
            totalEventsOrganized: acc.totalEventsOrganized + account.total_organized,
            totalEventsAttended: acc.totalEventsAttended + account.total_attended,
            totalRegistrations: acc.totalRegistrations + account.total_registered,
        }),
        {
            totalAccounts: 0,
            totalEventsOrganized: 0,
            totalEventsAttended: 0,
            totalRegistrations: 0,
        }
    );

    return { ...stats, isLoading: false, error: null };
};