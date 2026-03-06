import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
console.log('App loading...');

import { CameraScanner } from './components/organisms/CameraScanner';
import { AnalysisOverlay } from './components/organisms/AnalysisOverlay';
import { NanoBananaEngine } from './services/ai_engine/nanoBananaEngine';
import type { ChainOfVerificationResult } from './services/ai_engine/nanoBananaEngine';

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [result, setResult] = useState<ChainOfVerificationResult | null>(null);

  const handleCapture = async (photo: any) => {
    setIsProcessing(true);
    setShowOverlay(true);

    // Call the engine
    const analysisResult = await NanoBananaEngine.processLabel(photo?.path || 'mock_uri');

    setResult(analysisResult);
    setIsProcessing(false);
  };

  const handleCloseOverlay = () => {
    setShowOverlay(false);
    setTimeout(() => setResult(null), 300); // Wait for slide animation
  };

  console.log('Rendering App', { isProcessing, showOverlay });
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <CameraScanner onCapture={handleCapture} isProcessing={isProcessing} />
      <AnalysisOverlay
        isVisible={showOverlay}
        isProcessing={isProcessing}
        result={result}
        onClose={handleCloseOverlay}
      />
    </div>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100vh',
    width: '100vw',
    backgroundColor: '#000',
    overflow: 'hidden'
  },
});
