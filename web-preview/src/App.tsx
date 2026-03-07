import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
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
        <ScrollView
          style={styles.mainContent}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cameraWindow}>
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

          {/* BELOW PANEL INSTRUCTIONS */}
          <View style={styles.instructionSection}>
            <Text style={styles.instructionHeader}>Celiac Safety Scanner</Text>

            <View style={styles.instructionStep}>
              <View style={styles.stepIconContainer}>
                <Text style={styles.stepIconText}>1</Text>
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepTitle}>Scan & Verify</Text>
                <Text style={styles.stepDescription}>
                  Take a photo of the front of the packaging or the label ingredients and our AI will scan for gluten and celiac safe.
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🛡️</Text>
              <Text style={styles.infoText}>
                Always double-check results if you notice any unusual symptoms. Safety is our priority.
              </Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

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
    backgroundColor: '#F5F3E8',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  cameraWindow: {
    width: '100%',
    maxWidth: 400,
    height: 500, // Balanced height for the window
    backgroundColor: '#1E1E1E',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 30, // Space between panel and instructions
  },
  cameraFrame: {
    flex: 1,
  },
  instructionSection: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1B3022',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  instructionHeader: {
    color: '#F7F8F7',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'rgba(247, 248, 247, 0.05)',
    padding: 16,
    borderRadius: 20,
    alignItems: 'flex-start',
  },
  stepIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#A0D39B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  stepIconText: {
    color: '#1B3022',
    fontWeight: '900',
    fontSize: 16,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    color: '#F7F8F7',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepDescription: {
    color: 'rgba(247, 248, 247, 0.7)',
    fontSize: 15,
    lineHeight: 22,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(160, 211, 155, 0.1)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(160, 211, 155, 0.2)',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    color: '#A0D39B',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
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


