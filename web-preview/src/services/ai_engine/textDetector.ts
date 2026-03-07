export interface TextDetectionResult {
    hasText: boolean;
    detectedText?: string;
}

export const TextDetector = {
    /**
     * Identifies if a frame contains text.
     * @param dataUri Image URI
     * @returns Promise<TextDetectionResult>
     */
    async detectText(dataUri: string): Promise<TextDetectionResult> {
        // Real logic should use the same CoV pipeline or a lightweight OCR
        // For now, removing the mock wheat/barley/malt strings to avoid erroneous tests.
        if (!dataUri) return { hasText: false };

        return {
            hasText: true,
            detectedText: "Extracting labels via Nano Banana 2 Pipeline..."
        };
    }
};
