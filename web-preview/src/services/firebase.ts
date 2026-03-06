import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

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
export const functions = getFunctions(app);
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

export const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;

        // Add to Firestore
        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: displayName || email.split('@')[0],
            createdAt: new Date().toISOString()
        });

        return user;
    } catch (error) {
        console.error("Error signing up with email:", error);
        throw error;
    }
};

export const loginWithEmail = async (email: string, password: string) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error) {
        console.error("Error logging in with email:", error);
        throw error;
    }
};
