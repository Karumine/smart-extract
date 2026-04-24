/**
 * Gemini AI helper utilities for structured data extraction from images.
 */

/**
 * Builds an optimized prompt for Gemini to extract structured data from an image.
 * @param columns - Array of column names the user wants to extract
 * @returns A system prompt string
 */
export function buildExtractionPrompt(columns: string[]): string {
  const columnList = columns.map((col) => `"${col}"`).join(", ");

  return `You are a precise data extraction assistant specialized in processing labels and price tags.

INSTRUCTIONS:
1. FOCUS AREA: Pay special attention to text that is HIGHLIGHTED IN GREEN on the provided image(s). These are the primary values requested.
2. ID EXTRACTION: For the "ID" column, extract the sequence located directly BELOW the barcode.
3. SIZE EXTRACTION: For the "size" column (case-sensitive), extract the numeric or alphanumeric value located directly BELOW the metal indicator (e.g., "750WG", "Au999", "WG", "YG").
4. STONES EXTRACTION: For the "Stones" column, extract stone details with quantities (e.g., "1 CuD3.040, 6 RD0.060").
5. CERTIFICATE EXTRACTION: For the "Certificate" column, extract the FULL certificate identifier or quantity indicator, including any suffixes or special characters (e.g., "GIA 12345678", "(1) /g"). Do not omit any part of the text for this column. ถ้าไม่มีให้ใช้ "ไม่มี".
6. DATA AGGREGATION: For each image, return exactly ONE JSON object. If multiple values exist for one column, concatenate them.
7. COLUMN KEYS: You MUST use these EXACT keys: [${columnList}]. Do NOT use "Code" or any other name; use only the keys provided in this list.
8. FORMAT: Return ONLY a valid JSON array of objects. No markdown, no explanations.
9. MISSING DATA: If a value is missing, use "ไม่มี".

EXAMPLE OUTPUT:
[
  { ${columns.map((col) => `"${col}": "value"`).join(", ")} }
]

Analyze the image(s) and follow these rules strictly.`;
}

/**
 * Parses the Gemini response text into a structured JSON array.
 * Handles cases where the response might include markdown code fences.
 */
export function parseGeminiResponse(
  responseText: string
): Record<string, string | null>[] {
  // Remove markdown code fences if present
  let cleaned = responseText.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "");
  cleaned = cleaned.replace(/\n?```\s*$/i, "");
  cleaned = cleaned.trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    // If it's a single object, wrap in array
    if (typeof parsed === "object" && parsed !== null) {
      return [parsed];
    }
    return [];
  } catch {
    console.error("Failed to parse Gemini response:", cleaned);
    throw new Error(
      "Failed to parse AI response. The image might not contain extractable data."
    );
  }
}
