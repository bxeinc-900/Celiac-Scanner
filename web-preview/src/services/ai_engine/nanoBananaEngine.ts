import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

export interface ChainOfVerificationResult {
    status: 'SAFE' | 'UNSAFE' | 'UNCERTAIN';
    productName: string;
    brand: string;
    ingredients: string[];
    flaggedIngredients: string[];
    warnings: string[];
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const SYSTEM_INSTRUCTION = `
You are a highly precise, medical-grade dietary restriction analyst specifically focused on Celiac disease and gluten intolerance.
Your sole objective is to determine with absolute certainty whether a given food item is safe for a person with Celiac disease.

Chain-of-Verification (CoV) Instructions:
1. Identify: Name the product and brand from the image.
2. Scan Ingredients: Extract and flag gluten sources (Wheat, Barley, Rye, Malt, Brewer's Yeast).
3. Cross-Contamination Check: Specifically look for "May contain..." or "Processed in a facility..." warnings.
4. Web Grounding: Use search to verify if the specific batch or brand has recent "Gluten-Free" certification updates.

Return a strict JSON format matching the ChainOfVerificationResult structure.
`;

export const NanoBananaEngine = {
    /**
     * Processes the image through the Nano Banana 2 Pipeline using CoV.
     * @param imageUri Local path to the captured image, or base64 representation
     * @returns Verified Result Object
     */
    async processLabel(imageUri: string): Promise<ChainOfVerificationResult> {
        console.log('Agent Initiated: Sending to Nano Banana 2 CoV Pipeline via Firebase Cloud Functions');

        // We assume imageUri is already a base64 string or can be fetched 
        // to a base64 string. For our current mock (or real canvas capture), 
        // let's pass a dummy or the real base64 if it's a data URL.
        let base64Image = '';
        if (imageUri.startsWith('data:image')) {
            // "data:image/jpeg;base64,xxxxxx" -> "xxxxxx"
            base64Image = imageUri.split(',')[1];
        } else {
            // For now, if we use mock.jpg, we fall back to a small 1x1 base64 string 
            // to fulfill the payload, but the real app would capture a real image base64.
            console.warn("Using mock base64 for preview testing.");
            // Valid base64 1x1 PNG
            base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        }

        const processLabelCoV = httpsCallable<any, ChainOfVerificationResult>(functions, 'processLabelCoV');

        try {
            const result = await processLabelCoV({
                base64Image,
                mimeType: "image/jpeg"
            });
            console.log("Nano Banana CoV Real Result:", result.data);
            return result.data;
        } catch (error: any) {
            console.error("Cloud Function Nano Banana Error:", error);

            // Fallback gracefully for UI testing if the Gemini API key isn't set yet 
            // or the network fails.
            const isMockUnsafe = Math.random() > 0.5;
            return {
                status: isMockUnsafe ? 'UNSAFE' : 'SAFE',
                productName: isMockUnsafe ? 'Protein Bar (Contains Malt flavor)' : 'Organic Tortilla Chips',
                brand: isMockUnsafe ? 'Generic Foods' : 'Xochitl',
                ingredients: isMockUnsafe
                    ? ['Oats', 'Peanuts', 'Honey', 'Malt Extract', 'Salt']
                    : ['Organic White Corn', 'Organic Palm Olein', 'Water', 'Lime'],
                flaggedIngredients: isMockUnsafe ? ['Malt Extract'] : [],
                warnings: isMockUnsafe ? ['API Error - Falling back to mock data. Manufactured in a facility that also processes wheat.'] : ['API Error - Falling back to mock data.'],
                confidence: 'HIGH',
            };
        }
    }
};
