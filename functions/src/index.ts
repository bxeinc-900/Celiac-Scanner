import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `
You are a highly precise, medical-grade dietary restriction analyst specifically focused on Celiac disease and gluten intolerance. 
Your sole objective is to determine with absolute certainty whether a given food item (based on ingredients label, text, or visual scan) is safe for a person with Celiac disease.

### I. Celiac Reference Suite (Trusted Knowledge Domains)
You MUST prioritize and search these domains for verification:
* beyondceliac.org (Focus: Guides, newly diagnosed tips)
* celiac.org (Focus: Lists, label rules, Eat! Gluten-Free)
* nationalceliac.org (Focus: Certified products, eating tips)
* gluten.org (Focus: GFCO certified products database)
* celiac.com (Focus: Safe/unsafe ingredients, updated historical data)
* glutenfreewatchdog.org (Focus: Independent lab reports and testing)
* niddk.nih.gov (Focus: Government standards, naturally GF grains)

### II. The Annealing Loop (The Process)
1. **Identify**: Extract the PRODUCT NAME and BRAND NAME directly from the provided image. Do NOT default to generic products.
2. **Scan Ingredients**: Identify and list every single ingredient. Scrutinize ambiguous ones (natural flavors, modified food starch).
3. **Deep Research & Grounding**: Use Google Search to query the identified Product + Brand on the Celiac Reference Suite domains.
   - Example query: "[Product Name] [Brand Name] site:gluten.org OR site:celiac.org"
4. **Verification Synthesis**: 
   - SAFE: Listed as Certified on gluten.org or nationalceliac.org.
   - UNCERTAIN: Naturally GF grains (niddk.nih.gov) and no flags on beyondceliac.org, but no explicit certification found.
   - UNSAFE: Explicit gluten found or known issues on glutenfreewatchdog.org.

### III. Output Requirements
Return a structured JSON report. You MUST include at least 3 distinct domain references from the Celiac Reference Suite.
The summary should be concise but informative.
`;

const responseSchema = {
    type: "object",
    properties: {
        status: { type: "string", enum: ["SAFE", "UNSAFE", "UNCERTAIN"] },
        productName: { type: "string" },
        brand: { type: "string" },
        summary: { type: "string" },
        ingredients: { type: "array", items: { type: "string" } },
        flaggedIngredients: { type: "array", items: { type: "string" } },
        warnings: { type: "array", items: { type: "string" } },
        confidence: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
        references: { type: "array", items: { type: "string" } },
    },
    required: ["status", "productName", "brand", "summary", "ingredients", "flaggedIngredients", "warnings", "confidence", "references"]
};

export const processLabelCoV = onCall({
    memory: "1GiB",
    timeoutSeconds: 300,
    secrets: ["GEMINI_API_KEY"],
}, async (request) => {
    if (!request.auth) {
        throw new HttpsError(
            "unauthenticated",
            "You must be logged in to analyze labels."
        );
    }

    const { base64Image, scanMode = "PRODUCT", mimeType = "image/jpeg" } = request.data;

    if (!base64Image) {
        throw new HttpsError(
            "invalid-argument",
            "A base64 encoded image is required."
        );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new HttpsError(
            "internal",
            "Server misconfiguration: GEMINI_API_KEY is not set."
        );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Force image identification and deep research
    const userPrompt = `
        ANALYSIS TASK:
        Scanning Mode: ${scanMode}
        
        1. Context: You are currently looking at the ${scanMode === 'PRODUCT' ? 'front of the package' : 'ingredients label'} of a product.
        2. Action: Extract the exact Product Name and Brand from the image pixels. 
        3. Action: DEEP RESEARCH. You MUST perform specific search queries for the identified [Product Name] + [Brand Name] on the following domains:
           * site:gluten.org OR site:celiac.org (Certification check)
           * site:nationalceliac.org (Certified products check)
           * site:beyondceliac.org (Hidden ingredients check)
           * site:glutenfreewatchdog.org (Safety alerts check)
        4. Action: Synthesize a "Safety Score" based on the findings:
           * HIGH: Certified Gluten-Free on trusted domains.
           * MEDIUM: Naturally GF grains, no hidden gluten flags found.
           * LOW: Generic product or ambiguous warnings found.
           * UNSAFE: Explicit gluten or failed safety tests found.
        5. Output: Provide the detailed JSON report with at least 3 distinct domain references.
    `;

    const model = genAI.getGenerativeModel({
        model: "gemini-3.1-flash-image-preview", // Upgraded to Nano Banana 2 (3.1 Flash)
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: responseSchema as any,
        },
        tools: [
            {
                googleSearch: {} // Corrected tool name for this model/SDK
            } as any
        ],
    }, { apiVersion: "v1beta" });

    try {
        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64Image,
                    mimeType: mimeType,
                }
            },
            { text: userPrompt }
        ]);

        const response = result.response;
        const text = response.text();

        if (!text) {
            throw new Error("No response returned from Gemini.");
        }

        return JSON.parse(text);
    } catch (error: any) {
        logger.error("Celiac Safe Agent Error:", error);
        throw new HttpsError("internal", error.message || "Failed to process label.");
    }
});
