import { useState, useCallback } from 'react';

// 1. Define the possible return types and the hook's structure

interface GenerationResult {
    imageBlob: Blob;
    imageUrl: string;
    imageFile: File;
}

interface UseEmbossedImageGeneratorReturn {
    generateImage: (textToEmboss: string, eventTitle: string) => Promise<GenerationResult | null>;
    isGenerating: boolean;
    error: string | null;
}


export const useEmbossedImageGenerator = (): UseEmbossedImageGeneratorReturn => {
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const generateImage = useCallback(async (
        textToEmboss: string,
        eventTitle: string
    ): Promise<GenerationResult | null> => {
        setIsGenerating(true);
        setError(null);

        // Construct the detailed prompt for an embossed look
        const prompt = `An award-winning, metallic ${textToEmboss} design, embossed on a high-quality surface. Highly detailed, 3D render, digital art, focusing on deep shadows and raised, sculpted texture. Minimal and elegant design. The context is attendance at an event named "${eventTitle}".`;

        try {
            console.log("Could see the call!")
            // 2. Call the custom backend endpoint (as in your original logic)
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            console.log("This is the response", response)

            if (!response.ok) {
                // Read error details from the backend response
                const errorBody = await response.json();
                const errorMessage = errorBody.message || 'Unknown API Error';
                throw new Error(`Generation failed: ${response.status} - ${errorMessage}`);
            }

            const data: { image?: string } = await response.json();

            // 3. Process the Base64 image data returned by the backend
            if (data.image) {
                const base64Image = data.image; // e.g., 'data:image/png;base64,...'

                // Convert the Base64 image data URL into a Blob
                const res = await fetch(base64Image);
                if (!res.ok) {
                    throw new Error("Failed to convert Base64 data to Blob.");
                }
                const imageBlob = await res.blob();

                // Create a File object for easy uploading later
                const imageFile = new File([imageBlob], "generated-embossed-image.png", { type: "image/png" });

                // Create a temporary URL for immediate preview
                const imageUrl = URL.createObjectURL(imageBlob);

                return { imageBlob, imageUrl, imageFile };
            }

            // Should not happen if API is working, but handle missing image payload
            throw new Error("API returned success but no image data.");

        } catch (e) {
            console.error("Image generation failed:", e);
            // Type assertion for error handling in TypeScript
            setError(e instanceof Error ? e.message : "An unexpected error occurred during image generation.");
            return null;

        } finally {
            setIsGenerating(false);
        }
    }, []);

    return {
        generateImage,
        isGenerating,
        error,
    };
};