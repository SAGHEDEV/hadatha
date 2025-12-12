import { useSuiClientQuery } from "@mysten/dapp-kit";

export const useGetSingleEventDetails = (eventId: string) => {
    return useSuiClientQuery("getObject", {
        id: eventId,
        options: {
            showContent: true,
            showOwner: true,
        }
    }, {
        enabled: !!eventId
    });
};
