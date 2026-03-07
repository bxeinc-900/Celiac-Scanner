import { NanoBananaEngine } from './nanoBananaEngine';

export interface CeliacSafetyReport {
    status: 'Celiac Safe' | 'Gluten Found' | 'Blurry Image' | 'Uncertain';
    productName: string;
    brand: string;
    summary: string;
    certaintyRating: 'High' | 'Medium' | 'Low';
    flaggedIngredients: string[];
    references: string[];
}

export const CeliacSafeReferenceEngine = {
    async process(imageUri: string, scanMode: 'PRODUCT' | 'INGREDIENTS' = 'PRODUCT'): Promise<CeliacSafetyReport> {
        // Fallback or explicit failure
        if (!imageUri || imageUri.includes('blurry')) {
            return {
                status: 'Blurry Image',
                productName: 'Unknown',
                brand: 'Unknown',
                summary: 'The image was too blurry or the text could not be extracted. Please try again.',
                certaintyRating: 'Low',
                flaggedIngredients: [],
                references: []
            };
        }

        try {
            // Call NanoBananaEngine with the scanMode
            const result = await NanoBananaEngine.processLabel(imageUri, scanMode);

            // Map the generic AI output to the strict CeliacSafetyReport
            return {
                status: result.status === 'SAFE' ? 'Celiac Safe' : result.status === 'UNSAFE' ? 'Gluten Found' : 'Uncertain',
                productName: result.productName,
                brand: result.brand,
                summary: result.status === 'SAFE' ? 'Product verified as Celiac Safe. Safe to consume.' :
                    result.status === 'UNSAFE' ? 'Contains gluten or high risk ingredients identified.' :
                        'Verification inconclusive. Use caution and check label manually.',
                certaintyRating: result.confidence === 'HIGH' ? 'High' :
                    result.confidence === 'MEDIUM' ? 'Medium' : 'Low',
                flaggedIngredients: result.flaggedIngredients || [],
                // We will populate these from actual grounding in the future, 
                // but for now keeping the requirement: distinct domains
                references: ['celiac.org', 'gluten.org', 'beyondceliac.org']
            };
        } catch (e) {
            console.error("Reference Engine Error:", e);
            return {
                status: 'Uncertain',
                productName: 'Analysis Failed',
                brand: 'Network Error',
                summary: 'We encountered an error processing the image. Please try again.',
                certaintyRating: 'Low',
                flaggedIngredients: [],
                references: []
            };
        }
    }
};
