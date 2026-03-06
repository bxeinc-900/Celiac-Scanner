"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processLabelCoV = void 0;
const functions = require("firebase-functions");
const genai_1 = require("@google/genai");
// Nano Banana Chain-of-Verification System Instruction
const SYSTEM_INSTRUCTION = `
You are a highly precise, medical-grade dietary restriction analyst specifically focused on Celiac disease and gluten intolerance. 
Your sole objective is to determine with absolute certainty whether a given food item (based on ingredients label, text, or visual scan) is safe for a person with Celiac disease.

Chain-of-Verification Procedure:
1. Extraction: Identify and list every single ingredient present on the input label.
2. Highlighting: Flag any ingredient that is a known source of gluten (e.g., wheat, barley, rye, triticale, malt, brewer's yeast).
3. Hidden Sources Check: Scrutinize ambiguous ingredients (e.g., natural flavors, modified food starch, dextrin).
4. Cross-Contamination Warning: Check for "may contain" or "manufactured in a facility that also processes" statements regarding wheat.
5. Final Verdict: Summarize the findings into a clear binary state.
`;
const responseSchema = {
    type: genai_1.Type.OBJECT,
    properties: {
        status: { type: genai_1.Type.STRING, enum: ['SAFE', 'UNSAFE', 'UNCERTAIN'] },
        productName: { type: genai_1.Type.STRING },
        brand: { type: genai_1.Type.STRING },
        ingredients: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
        flaggedIngredients: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
        warnings: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
        confidence: { type: genai_1.Type.STRING, enum: ['HIGH', 'MEDIUM', 'LOW'] },
    },
    required: ["status", "productName", "brand", "ingredients", "flaggedIngredients", "warnings", "confidence"]
};
// Define a remote configuration parameter or secret for the Gemini API key.
// In a real app we'd use defineSecret or Functions Configuration, 
// using process.env here for immediate demonstration purposes.
exports.processLabelCoV = functions.https.onCall(async (data, context) => {
    // Basic verification - Ensure user is authenticated
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
    const ai = new genai_1.GoogleGenAI({ apiKey });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            inlineData: {
                                data: base64Image,
                                mimeType: mimeType,
                            }
                        },
                        { text: "Analyze this ingredient label carefully." }
                    ]
                }
            ],
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });
        if (!response.text) {
            throw new Error("No response returned from Gemini.");
        }
        // Return parsed JSON structure
        return JSON.parse(response.text);
    }
    catch (error) {
        functions.logger.error("Nano Banana Agent Error:", error);
        throw new functions.https.HttpsError("internal", error.message || "Failed to process label.");
    }
});
//# sourceMappingURL=index.js.map