import { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { CircleUser, ClipboardList, Camera, Map, ChefHat } from 'lucide-react';

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

    // Make mock data closely match the mock up
    setResult({
      ...analysisResult,
      status: 'SAFE',
      productName: "Cheery-O's Cereal"
    });
    setIsProcessing(false);
  };

  const handleCloseOverlay = () => {
    setShowOverlay(false);
    setTimeout(() => setResult(null), 300); // Wait for slide animation
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* TOP HEADER */}
        <View style={styles.header}>
          <Image
            source={{ uri: '/logo-trans.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <CircleUser color="#2A422B" size={40} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, { alignItems: 'center' }]}>
              <ClipboardList color="#2A422B" size={32} strokeWidth={2} />
              <Text style={styles.iconTextDark}>History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* MAIN CONTENT AREA */}
        <View style={styles.mainContent}>
          <View style={styles.cameraFrameWrapper}>
            <View style={styles.cameraFrame}>
              <CameraScanner onCapture={handleCapture} isProcessing={isProcessing} />
            </View>

            {/* Overlapping card logic here */}
            {showOverlay && (
              <AnalysisOverlay
                isVisible={showOverlay}
                isProcessing={isProcessing}
                result={result}
                onClose={handleCloseOverlay}
              />
            )}
          </View>
        </View>

        {/* BOTTOM NAVIGATION */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Camera color="#2A422B" size={32} strokeWidth={2.5} />
            <Text style={styles.navText}>SCAN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Map color="#2A422B" size={32} strokeWidth={2.5} />
            <Text style={styles.navText}>EATERIES</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <ChefHat color="#2A422B" size={32} strokeWidth={2.5} />
            <Text style={styles.navText}>RECIPES</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <ClipboardList color="#2A422B" size={32} strokeWidth={2.5} />
            <Text style={styles.navText}>MY LOGS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F3E8', // Creamy color from mockup
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F3E8',
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
    paddingLeft: 0,
    paddingTop: 16,
    paddingBottom: 8,
  },
  logo: {
    width: 336,
    height: 102,
    marginLeft: -24, // Pulling it flush to the left boundary
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconTextDark: {
    color: '#2A422B',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 0,
    position: 'relative',
  },
  cameraFrameWrapper: {
    flex: 1,
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
  },
  cameraFrame: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F5F3E8',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navText: {
    color: '#2A422B',
    fontSize: 14,
    fontWeight: '800',
  }
});


