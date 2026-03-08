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
import { HistoryScreen } from './components/organisms/HistoryScreen';
import { saveScanToHistory } from './services/historyService';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'SCAN' | 'HISTORY'>('SCAN');
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
    setResult(null);

    try {
      // Call the engine with scanMode
      const analysisResult = await CeliacSafeReferenceEngine.process(path, scanMode);
      setResult(analysisResult);
    } catch (e: any) {
      console.error("Capture Failed:", e);
      // Fallback for user feedback
      setResult({
        status: 'Uncertain',
        productName: 'Analysis Failed',
        brand: 'Service Error',
        summary: `The AI Engine is currently unavailable or returned an error: ${e.message}`,
        certaintyRating: 'Low',
        flaggedIngredients: [],
        ingredients: [],
        warnings: ['Check internet connection', 'Ensure GEMINI_API_KEY is active'],
        references: []
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseModal = () => {
    setTimeout(() => setResult(null), 100);
  };

  const handleSaveToHistory = async () => {
    try {
      if (result) {
        await saveScanToHistory(result);
        console.log("Saved to history successfully");
      }
    } catch (e) {
      console.error("Failed to save to history", e);
    } finally {
      handleCloseModal();
      setCurrentTab('HISTORY');
    }
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
          <View style={styles.logoCenterContainer} pointerEvents="none">
            <Image
              source={{ uri: '/logo-trans.png' }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Right: History Icon */}
          <TouchableOpacity
            style={styles.headerSideButton}
            onPress={() => setCurrentTab('HISTORY')}
          >
            <ClipboardList color="#2A422B" size={32} strokeWidth={2} />
            <Text style={styles.headerIconText}>History</Text>
          </TouchableOpacity>
        </View>

        {/* MAIN CONTENT AREA */}
        {currentTab === 'HISTORY' ? (
          <HistoryScreen />
        ) : (
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
            <Text style={styles.instructionTextBelow}>
              Take a picture of the front of the packaging you would like to scan.
            </Text>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {/* BOTTOM NAVIGATION */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCurrentTab('SCAN')}
          >
            <Camera color={currentTab === 'SCAN' ? "#A0D39B" : "#2A422B"} size={28} strokeWidth={2.5} />
            <Text style={[styles.navText, currentTab === 'SCAN' && { color: '#A0D39B' }]}>SCAN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Map color="#2A422B" size={28} strokeWidth={2} />
            <Text style={styles.navText}>EATERIES</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <ChefHat color="#2A422B" size={28} strokeWidth={2} />
            <Text style={styles.navText}>RECIPES</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCurrentTab('HISTORY')}
          >
            <ClipboardList color={currentTab === 'HISTORY' ? "#A0D39B" : "#2A422B"} size={28} strokeWidth={2} />
            <Text style={[styles.navText, currentTab === 'HISTORY' && { color: '#A0D39B' }]}>MY LOGS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Clean white background for main area
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    height: 110,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  headerSideButton: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    position: 'relative',
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
    width: 280,
    height: 96,
    marginTop: 10,
  },
  headerIconText: {
    color: '#8E9AAF', // More muted text color for header icons
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  cameraWindow: {
    width: '100%',
    maxWidth: 400,
    height: 480,
    backgroundColor: '#0A0E1A', // Darker blue-black from mockup
    borderRadius: 36,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cameraFrame: {
    flex: 1,
  },
  instructionTextBelow: {
    color: '#8E9AAF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 10,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 18,
    backgroundColor: '#F9F8F3', // Light beige from mockup
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  navText: {
    color: '#2A422B',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  }
});


