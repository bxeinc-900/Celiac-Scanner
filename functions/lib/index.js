"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processLabelCoV = void 0;
const functions = require("firebase-functions");
const generative_ai_1 = require("@google/generative-ai");
const SYSTEM_INSTRUCTION = `
You are a highly precise, medical-grade dietary restriction analyst specifically focused on Celiac disease and gluten intolerance. 
Your sole objective is to determine with absolute certainty whether a given food item (based on ingredients label, text, or visual scan) is safe for a person with Celiac disease.

Chain-of-Verification & Deep Research Procedure:
1. Extraction: Identify and list every single ingredient present on the input label.
2. Deep Research: Use Google Search to look up the specific product and brand. Search for official "Gluten-Free" certifications (GFCO, Beyond Celiac, etc.) and any recent recalls or manufacturer statements regarding gluten and shared equipment.
3. Highlighting: Flag any ingredient that is a known source of gluten (e.g., wheat, barley, rye, triticale, malt, brewer's yeast).
4. Hidden Sources Check: Scrutinize ambiguous ingredients (e.g., natural flavors, modified food starch, dextrin).
5. Cross-Contamination Warning: Detail cross-contamination risks based on manufacturer research.
6. Final Verdict: Summarize the findings into a clear binary state with High, Medium, or Low confidence.
`;
const responseSchemaMock = {
    type: "object",
    properties: {
        status: { type: "string", enum: ["SAFE", "UNSAFE", "UNCERTAIN"] },
        productName: { type: "string" },
        brand: { type: "string" },
        ingredients: { type: "array", items: { type: "string" } },
        flaggedIngredients: { type: "array", items: { type: "string" } },
        warnings: { type: "array", items: { type: "string" } },
        confidence: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
    },
    required: ["status", "productName", "brand", "ingredients", "flaggedIngredients", "warnings", "confidence"]
};
exports.processLabelCoV = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to analyze labels.");
    }
    const { base64Image, mimeType = "image/jpeg" } = data;
    if (!base64Image) {
        throw new functions.https.HttpsError("invalid-argument", "A base64 encoded image is required.");
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new functions.https.HttpsError("internal", "Server misconfiguration: GEMINI_API_KEY is not set.");
    }
    const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash which supports tools and grounding
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
            { text: "Perform deep research on this product to verify its Celiac safety. Check official brand websites and certification databases." }
        ]);
        const response = result.response;
        const text = response.text();
        if (!text) {
            throw new Error("No response returned from Gemini.");
        }
        return JSON.parse(text);
    }
    catch (error) {
        functions.logger.error("Celiac Safe Agent Error:", error);
        throw new functions.https.HttpsError("internal", error.message || "Failed to process label.");
    }
});
//# sourceMappingURL=index.js.map