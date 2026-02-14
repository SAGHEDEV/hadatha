import { useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { REGISTRY_PACKAGE_ID, EVENTS_MODULE } from "@/lib/constant";
import { useQuery } from "@tanstack/react-query";

export const useCheckRegistered = (event: string, attendee: string) => {
    const client = useSuiClient();

    return useQuery({
        queryKey: ["checkRegistered", event, attendee],
        queryFn: async () => {
            const tx = new Transaction();
            tx.moveCall({
                target: `${REGISTRY_PACKAGE_ID}::${EVENTS_MODULE}::is_registered`,
                arguments: [
                    tx.object(event),
                    tx.pure.address(attendee)
                ]
            });

            const result = await client.devInspectTransactionBlock({
                transactionBlock: tx,
                sender: attendee // Using attendee as sender for context, though view function shouldn't matter
            });

            if (result.results && result.results[0]?.returnValues) {
                const value = result.results[0].returnValues[0];
                // value is [bytes, type]
                const bytes = Uint8Array.from(value[0]);
                // 1 is true, 0 is false
                return bytes[0] === 1;
            }
            return false;
        },
        enabled: !!event && !!attendee
    });
};
