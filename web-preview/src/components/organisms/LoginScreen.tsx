import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { signInWithGoogle, loginWithEmail, signUpWithEmail } from '../../services/firebase';

export function LoginScreen() {
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleGoogleSignIn = async () => {
        setIsSigningIn(true);
        setErrorMsg('');
        try {
            await signInWithGoogle();
        } catch (error: any) {
            console.error("Failed to sign in with Google:", error);
            setErrorMsg(error?.message || 'Google sign-in failed. Check pop-up blockers.');
            setIsSigningIn(false);
        }
    };

    const handleEmailAuth = async () => {
        if (!email || !password) {
            setErrorMsg("Please enter both email and password.");
            return;
        }

        setIsSigningIn(true);
        setErrorMsg('');
        try {
            if (isLoginMode) {
                await loginWithEmail(email, password);
            } else {
                await signUpWithEmail(email, password);
            }
        } catch (error: any) {
            console.error("Failed email auth:", error);
            // Provide user friendly messages for common errors
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                setErrorMsg('Invalid email or password.');
            } else if (error.code === 'auth/email-already-in-use') {
                setErrorMsg('An account with this email already exists.');
            } else if (error.code === 'auth/weak-password') {
                setErrorMsg('Password must be at least 6 characters long.');
            } else {
                setErrorMsg(error?.message || 'Authentication failed. Please try again.');
            }
            setIsSigningIn(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.content}>
                <Image
                    source={{ uri: '/logo-trans.png' }}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.title}>{isLoginMode ? 'Welcome back.' : 'Create Account.'}</Text>
                <Text style={styles.subtitle}>
                    {isLoginMode
                        ? 'Sign in to save your history and sync across devices.'
                        : 'Sign up to start tracking your safe products securely.'}
                </Text>

                {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email Address"
                        placeholderTextColor="#7F8D80"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#7F8D80"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleEmailAuth}
                        disabled={isSigningIn}
                    >
                        {isSigningIn ? (
                            <ActivityIndicator color="#F5F3E8" />
                        ) : (
                            <Text style={styles.primaryButtonText}>
                                {isLoginMode ? 'Sign In' : 'Sign Up'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            setIsLoginMode(!isLoginMode);
                            setErrorMsg('');
                        }}
                        style={styles.toggleModeButton}
                    >
                        <Text style={styles.toggleModeText}>
                            {isLoginMode
                                ? "Don't have an account? Sign up"
                                : "Already have an account? Sign in"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                    style={styles.googleButton}
                    onPress={handleGoogleSignIn}
                    disabled={isSigningIn}
                >
                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#2A422B',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#4A5B4B',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    errorText: {
        color: '#D84315',
        backgroundColor: '#FBE9E7',
        padding: 12,
        borderRadius: 8,
        width: '100%',
        textAlign: 'center',
        marginBottom: 16,
        overflow: 'hidden',
    },
    formContainer: {
        width: '100%',
        marginBottom: 24,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(42, 66, 43, 0.15)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#2A422B',
        marginBottom: 12,
        width: '100%',
    },
    primaryButton: {
        backgroundColor: '#2A422B',
        paddingVertical: 14,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#F5F3E8',
    },
    toggleModeButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    toggleModeText: {
        color: '#4A5B4B',
        fontSize: 14,
        fontWeight: '600',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(42, 66, 43, 0.1)',
    },
    dividerText: {
        paddingHorizontal: 16,
        color: '#7F8D80',
        fontSize: 12,
        fontWeight: '600',
    },
    googleButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(42, 66, 43, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2A422B',
    }
});
