import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

export interface ChainOfVerificationResult {
    status: 'SAFE' | 'UNSAFE' | 'UNCERTAIN';
    productName: string;
    brand: string;
    ingredients: string[];
    flaggedIngredients: string[];
    warnings: string[];
    references: string[];
    summary: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const NanoBananaEngine = {
    /**
     * Processes the image through the Nano Banana 2 Pipeline using CoV.
     */
    async processLabel(imageUri: string, scanMode: 'PRODUCT' | 'INGREDIENTS' = 'PRODUCT'): Promise<ChainOfVerificationResult> {
        console.log(`Agent Initiated: Sending to Nano Banana 2 CoV Pipeline [Mode: ${scanMode}]`);

        if (!imageUri || !imageUri.startsWith('data:image')) {
            throw new Error("Invalid image format. Live camera capture required.");
        }
        const base64Image = imageUri.split(',')[1];

        try {
            const processLabelCoV = httpsCallable<any, ChainOfVerificationResult>(functions, 'processLabelCoV');
            const result = await processLabelCoV({
                base64Image,
                scanMode,
                mimeType: "image/jpeg"
            });
            return result.data;
        } catch (e: any) {
            console.error("Cloud function failure:", e);
            throw new Error(e.message || "AI Analysis Service Unavailable. Please ensure the backend is deployed.");
        }
    }
};
