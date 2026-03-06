import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { CircleUser, ClipboardList, Camera, Map, ChefHat } from 'lucide-react';

import { CameraScanner } from './components/organisms/CameraScanner';
import { AnalysisOverlay } from './components/organisms/AnalysisOverlay';
import { ModalPanel } from './components/organisms/ModalPanel';
import { CeliacSafeReferenceEngine } from './services/ai_engine/celiacSafeReferenceEngine';
import type { CeliacSafetyReport } from './services/ai_engine/celiacSafeReferenceEngine';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './services/firebase';
import { LoginScreen } from './components/organisms/LoginScreen';

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
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

  const handleCapture = async (photo: any) => {
    setIsProcessing(true);

    // Call the engine
    const analysisResult = await CeliacSafeReferenceEngine.process(photo?.path || 'mock_uri');

    setResult(analysisResult);
    setIsProcessing(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTimeout(() => setResult(null), 400); // Wait for slide animation
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
            {isProcessing && <AnalysisOverlay isVisible={isProcessing} />}

            <ModalPanel
              isVisible={showModal}
              report={result}
              onClose={handleCloseModal}
              onSave={handleSaveToHistory}
            />
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


