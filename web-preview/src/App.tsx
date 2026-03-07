import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { CircleUser, ClipboardList, Camera, Map, ChefHat } from 'lucide-react';

import { CameraScanner } from './components/organisms/CameraScanner';
import { AnalysisOverlay } from './components/organisms/AnalysisOverlay';
import { CeliacSafeReferenceEngine } from './services/ai_engine/celiacSafeReferenceEngine';
import type { CeliacSafetyReport } from './services/ai_engine/celiacSafeReferenceEngine';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './services/firebase';
import { LoginScreen } from './components/organisms/LoginScreen';

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<CeliacSafetyReport | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
      setUser(currentUser);
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  if (isInitializing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2A422B" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const handleCapture = async ({ path, scanMode }: { path: string, scanMode: 'PRODUCT' | 'INGREDIENTS' }) => {
    setIsProcessing(true);

    // Call the engine with scanMode
    const analysisResult = await CeliacSafeReferenceEngine.process(path, scanMode);

    setResult(analysisResult);
    setIsProcessing(false);
    // setShowModal(true); // Redundant now as AnalysisOverlay handles results
  };

  const handleCloseModal = () => {
    setTimeout(() => setResult(null), 100);
  };

  const handleSaveToHistory = () => {
    console.log("Saved to history!");
    handleCloseModal();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* TOP HEADER */}
        <View style={styles.header}>
          {/* Left: Profile Icon */}
          <TouchableOpacity style={styles.headerSideButton}>
            <CircleUser color="#2A422B" size={32} strokeWidth={2} />
          </TouchableOpacity>

          {/* Center: Logo */}
          <View style={styles.logoCenterContainer}>
            <Image
              source={{ uri: '/logo-trans.png' }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Right: History Icon */}
          <TouchableOpacity style={styles.headerSideButton}>
            <ClipboardList color="#2A422B" size={32} strokeWidth={2} />
            <Text style={styles.headerIconText}>History</Text>
          </TouchableOpacity>
        </View>

        {/* MAIN CONTENT AREA */}
        <View style={styles.mainContent}>
          <View style={styles.cameraFrameWrapper}>
            <View style={styles.cameraFrame}>
              <CameraScanner onCapture={handleCapture} isProcessing={isProcessing} />
            </View>

            {/* Analysis Overlay handles both loading and final report */}
            {(isProcessing || result) && (
              <AnalysisOverlay
                isVisible={isProcessing || !!result}
                isProcessing={isProcessing}
                result={result}
                onClose={handleCloseModal}
                onSave={handleSaveToHistory}
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#F5F3E8',
    height: 80,
  },
  headerSideButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  logoCenterContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  logo: {
    width: 180, // More compact for mobile
    height: 54,
  },
  headerIconText: {
    color: '#2A422B',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
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


