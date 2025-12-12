import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function GET() {
    if (!ai) {
        return NextResponse.json({ error: "No API Key" });
    }

    try {
        const response = await ai.models.list();
        // The response structure might vary, let's return the whole thing or map it
        // Usually it returns an object with 'models' array
        return NextResponse.json(response);
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) });
    }
}
