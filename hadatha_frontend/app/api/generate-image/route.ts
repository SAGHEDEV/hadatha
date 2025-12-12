import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ message: 'Missing required parameter: prompt' }, { status: 400 });
        }

        // Pollinations.AI URL
        // We encode the prompt to ensure it's URL-safe
        const encodedPrompt = encodeURIComponent(prompt);
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&private=true&enhance=true`;

        console.log("Fetching from Pollinations:", pollinationsUrl);

        const response = await fetch(pollinationsUrl);

        if (!response.ok) {
            throw new Error(`Pollinations API failed with status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;

        return NextResponse.json({ image: dataUrl });

    } catch (error) {
        console.error('Image Generation Error:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Internal server error during image generation.' },
            { status: 500 }
        );
    }
}
