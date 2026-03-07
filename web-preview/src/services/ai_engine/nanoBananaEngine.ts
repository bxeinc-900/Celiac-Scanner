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
        console.log(`[NanoBananaEngine] Initiating CoV Analysis Pipeline...`);
        console.log(`[NanoBananaEngine] Scan Mode: ${scanMode}`);

        if (!imageUri || !imageUri.startsWith('data:image')) {
            console.error("[NanoBananaEngine] Invalid image data provided.");
            throw new Error("Invalid image format. Live camera capture required.");
        }

        const base64Image = imageUri.split(',')[1];
        console.log(`[NanoBananaEngine] Image extracted. Byte size: ${Math.round(base64Image.length * 0.75)}`);

        try {
            console.log(`[NanoBananaEngine] Calling 'processLabelCoV' Cloud Function...`);
            const processLabelCoV = httpsCallable<any, ChainOfVerificationResult>(functions, 'processLabelCoV');
            const result = await processLabelCoV({
                base64Image,
                scanMode,
                mimeType: "image/jpeg"
            });

            console.log(`[NanoBananaEngine] AI Response Received:`, result.data.status);
            return result.data;
        } catch (e: any) {
            console.error("[NanoBananaEngine] AI Pipeline Failure:", e);
            throw new Error(e.message || "AI Analysis Service Unavailable. Please ensure the backend is deployed.");
        }
    }
};
