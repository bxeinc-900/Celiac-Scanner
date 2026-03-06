import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyB5mJZQXaNBAUGGrVKQwx060_5bBoApzag",
    authDomain: "celiac-scanner.firebaseapp.com",
    projectId: "celiac-scanner",
    storageBucket: "celiac-scanner.firebasestorage.app",
    messagingSenderId: "834863180563",
    appId: "1:834863180563:web:f0c0be69aa0350da9848e6",
    measurementId: "G-K1V06LXHXV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user exists in Firestore
        const userRef = doc(firestore, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // Create separate database/document for the user to keep history
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                createdAt: new Date().toISOString()
            });
        }

        return user;
    } catch (error) {
        console.error("Error signing in with Google:", error);
        throw error;
    }
};
