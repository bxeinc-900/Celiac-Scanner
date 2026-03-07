import { NanoBananaEngine } from './nanoBananaEngine';

export interface CeliacSafetyReport {
    status: 'Celiac Safe' | 'Gluten Found' | 'Blurry Image' | 'Uncertain';
    productName: string;
    brand: string;
    summary: string;
    certaintyRating: 'High' | 'Medium' | 'Low';
    flaggedIngredients: string[];
    ingredients: string[];
    warnings: string[];
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
                ingredients: [],
                warnings: [],
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
                summary: result.summary,
                certaintyRating: result.confidence === 'HIGH' ? 'High' :
                    result.confidence === 'MEDIUM' ? 'Medium' : 'Low',
                flaggedIngredients: result.flaggedIngredients || [],
                ingredients: result.ingredients || [],
                warnings: result.warnings || [],
                references: result.references || []
            };
        } catch (e: any) {
            console.error("Reference Engine Error:", e);
            throw e;
        }
    }
};
