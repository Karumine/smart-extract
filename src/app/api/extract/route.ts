/**
 * API Route: POST /api/extract
 * Handles image-to-text extraction using Google Gemini.
 * Supports multiple images in a single request.
 *
 * Accepts: { images: Array<{base64: string, mimeType: string}>, columns: string[] }
 * Returns: { data: Array<Record<string, string | null>> }
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { buildExtractionPrompt, parseGeminiResponse } from "@/lib/gemini";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Please set GEMINI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { images, columns } = body;

    // Validate required fields
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Missing image data. Please upload at least one image." },
        { status: 400 }
      );
    }

    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      return NextResponse.json(
        { error: "Please define at least one column to extract." },
        { status: 400 }
      );
    }

    // Build the prompt
    const prompt = buildExtractionPrompt(columns);

    // Use gemini-flash-latest (most robust model pointer)
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // Prepare image parts for all images
    const imageParts = images.map((img: { base64: string; mimeType: string }) => ({
      inlineData: {
        data: img.base64,
        mimeType: img.mimeType || "image/jpeg",
      },
    }));

    // Call Gemini API with all images + prompt
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    // Parse the response
    const data = parseGeminiResponse(text);

    return NextResponse.json({ data, rawResponse: text });
  } catch (error: unknown) {
    console.error("Extraction error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return NextResponse.json(
      { error: `Extraction failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
