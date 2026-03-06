export interface TextDetectionResult {
    hasText: boolean;
    detectedText?: string;
}

export const TextDetector = {
    /**
     * Identifies if a frame contains text.
     * @param frame Mock frame data or image URI
     * @returns Promise<TextDetectionResult>
     */
    async detectText(frame: string): Promise<TextDetectionResult> {
        // Mock logic for text detection
        // In a real implementation, this would use an OCR library or an AI model
        const hasText = frame.toLowerCase().includes('text');

        return {
            hasText,
            detectedText: hasText ? "Sample ingredients: Wheat, Barley, Malt" : undefined
        };
    }
};
