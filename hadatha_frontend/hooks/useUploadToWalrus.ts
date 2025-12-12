import { useState } from 'react';

const PUBLISHERS = [
    'https://publisher.walrus-testnet.walrus.space',
    'https://wal-publisher-testnet.staketab.org',
    'https://walrus-testnet-publisher.redundex.com',
    'https://walrus-testnet-publisher.nodes.guru',
    'https://publisher.walrus.banansen.dev',
    'https://walrus-testnet-publisher.everstake.one',
];

const AGGREGATORS = [
    'https://aggregator.walrus-testnet.walrus.space',
    'https://wal-aggregator-testnet.staketab.org',
    'https://walrus-testnet-aggregator.redundex.com',
    'https://walrus-testnet-aggregator.nodes.guru',
    'https://aggregator.walrus.banansen.dev',
    'https://walrus-testnet-aggregator.everstake.one',
];

const NUM_EPOCH = 5;

export const useUploadToWalrus = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadToWalrus = async (file: File | Blob): Promise<string> => {
        setIsUploading(true);
        setError(null);

        try {
            let blobId: string | null = null;

            // 1. Upload to Publisher
            for (const publisherBase of PUBLISHERS) {
                try {
                    const publisherUrl = `${publisherBase}/v1/blobs?epochs=${NUM_EPOCH}`;
                    const response = await fetch(publisherUrl, {
                        method: 'PUT',
                        body: file, // <-- send File/Blob directly
                    });

                    if (response.status === 200) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const storageInfo: any = await response.json();

                        if ('alreadyCertified' in storageInfo) {
                            blobId = storageInfo.alreadyCertified.blobId;
                        } else if ('newlyCreated' in storageInfo) {
                            blobId = storageInfo.newlyCreated.blobObject.blobId;
                        } else {
                            throw new Error('Unexpected Walrus response format');
                        }

                        console.log('Uploaded to Walrus via', publisherBase);
                        break; // Stop after successful upload
                    }
                } catch (err) {
                    console.warn(`Failed to upload to ${publisherBase}, trying next...`, err);
                    continue;
                }
            }

            if (!blobId) {
                throw new Error('Failed to upload to any Walrus publisher');
            }

            // 2. Find a working Aggregator
            for (const aggregatorBase of AGGREGATORS) {
                try {
                    const blobUrl = `${aggregatorBase}/v1/blobs/${blobId}`; // <-- corrected URL

                    // Optional: Check if the blob is accessible (HEAD request)
                    const checkResponse = await fetch(blobUrl, { method: 'HEAD' });

                    if (checkResponse.ok) {
                        console.log('Found working aggregator:', aggregatorBase);
                        return blobUrl;
                    }
                } catch (err) {
                    console.warn(`Failed to reach aggregator ${aggregatorBase}, trying next...`, err);
                    continue;
                }
            }

            // Fallback: If all checks fail (maybe due to propagation delay), return the first one
            console.warn("Could not verify blob on any aggregator immediately. Returning default.");
            return `${AGGREGATORS[0]}/v1/blobs/${blobId}`;

        } catch (err) {
            console.error("Walrus upload error:", err);
            setError(err instanceof Error ? err.message : "Unknown error occurred");
            throw err;
        } finally {
            setIsUploading(false);
        }
    };

    return { uploadToWalrus, isUploading, error };
};
