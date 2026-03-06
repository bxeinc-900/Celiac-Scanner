import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { signInWithGoogle } from '../../services/firebase';

export function LoginScreen() {
    const [isSigningIn, setIsSigningIn] = useState(false);

    const handleSignIn = async () => {
        setIsSigningIn(true);
        try {
            await signInWithGoogle();
            // On success, the auth state change in App.tsx will navigate away
        } catch (error) {
            console.error("Failed to sign in:", error);
            setIsSigningIn(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Image
                    source={{ uri: '/logo-trans.png' }}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.title}>Welcome back.</Text>
                <Text style={styles.subtitle}>Sign in to save your history and sync across devices.</Text>

                <TouchableOpacity
                    style={styles.googleButton}
                    onPress={handleSignIn}
                    disabled={isSigningIn}
                >
                    {isSigningIn ? (
                        <ActivityIndicator color="#2A422B" />
                    ) : (
                        <Text style={styles.buttonText}>Continue with Google</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F3E8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 32,
        alignItems: 'center',
        width: '100%',
        maxWidth: 400,
    },
    logo: {
        width: 250,
        height: 80,
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#2A422B',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#4A5B4B',
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 24,
    },
    googleButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(42, 66, 43, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2A422B',
    }
});
