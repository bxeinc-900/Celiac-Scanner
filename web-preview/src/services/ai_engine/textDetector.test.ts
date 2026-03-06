import { describe, it, expect } from 'vitest';
import { TextDetector } from './textDetector';

describe('TextDetector', () => {
    it('should detect text in a frame when text is present', async () => {
        const mockFrame = 'frame_with_text';
        const result = await TextDetector.detectText(mockFrame);
        expect(result.hasText).toBe(true);
    });

    it('should return false when no text is present', async () => {
        const mockFrame = 'blank_frame';
        const result = await TextDetector.detectText(mockFrame);
        expect(result.hasText).toBe(false);
    });
});
