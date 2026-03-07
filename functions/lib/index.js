"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processLabelCoV = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const generative_ai_1 = require("@google/generative-ai");
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
   - HIGH: Listed as Certified on gluten.org or nationalceliac.org.
   - MEDIUM: Naturally GF grains (niddk.nih.gov) and no flags on beyondceliac.org.
   - LOW: Unsafe flags (e.g. Malt Extract) found on celiac.com.
   - UNSAFE: Explicit gluten found or known issues on glutenfreewatchdog.org.

### III. Output Requirements
Return a structured JSON report. You MUST include at least 3 distinct domain references from the Celiac Reference Suite.
The summary should be concise but informative (e.g., "Product X is GFCO Certified. Safe to consume.").
`;
const responseSchemaMock = {
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
exports.processLabelCoV = (0, https_1.onCall)({
    memory: "512MiB",
    timeoutSeconds: 300,
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "You must be logged in to analyze labels.");
    }
    const { base64Image, scanMode = "PRODUCT", mimeType = "image/jpeg" } = request.data;
    if (!base64Image) {
        throw new https_1.HttpsError("invalid-argument", "A base64 encoded image is required.");
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new https_1.HttpsError("internal", "Server misconfiguration: GEMINI_API_KEY is not set.");
    }
    const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    // Force image identification
    const userPrompt = `
        ANALYSIS TASK:
        Scanning Mode: ${scanMode}
        
        1. Context: You are currently looking at the ${scanMode === 'PRODUCT' ? 'front of the package' : 'ingredients label'} of a product.
        2. Action: Extract the exact Product Name and Brand from the image pixels. Do not pull from memory unless the pixels are clear.
        3. Action: Research safety using the Celiac Reference Suite.
        4. Output: Provide the detailed JSON report.
    `;
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: responseSchemaMock,
        },
        tools: [
            {
                googleSearchRetrieval: {}
            }
        ],
    });
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
        const parsed = JSON.parse(text);
        return parsed;
    }
    catch (error) {
        logger.error("Celiac Safe Agent Error:", error);
        throw new https_1.HttpsError("internal", error.message || "Failed to process label.");
    }
});
//# sourceMappingURL=index.js.map