import { useState, useEffect, useRef, useCallback } from 'react';
import type { FC } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

interface CameraScannerProps {
    onCapture: (photo: { path: string, scanMode: 'PRODUCT' | 'INGREDIENTS' }) => void;
    isProcessing: boolean;
}

export const CameraScanner: FC<CameraScannerProps> = ({ onCapture, isProcessing }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    // Effect 1: Request camera stream
    const setupCamera = useCallback(async () => {
        setHasPermission(null);
        try {
            const s = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });
            setStream(s);
            setHasPermission(true);
        } catch (err) {
            console.warn("High-res failed, retrying with defaults:", err);
            try {
                const s = await navigator.mediaDevices.getUserMedia({ video: true });
                setStream(s);
                setHasPermission(true);
            } catch (retryErr) {
                console.error("Camera access failed:", retryErr);
                setHasPermission(false);
            }
        }
    }, []); // Removed stream from useCallback dependencies as it's set within the function, to avoid infinite loop.

    useEffect(() => {
        setupCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Effect 2: Attach stream to video element once both are available
    useEffect(() => {
        if (hasPermission && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [hasPermission, stream]);

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || isProcessing) return;

        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            onCapture({ path: dataUrl, scanMode: 'PRODUCT' });
        }
    }, [onCapture, isProcessing]);

    if (hasPermission === false) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.errorIconContainer}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                </View>
                <Text style={styles.errorText}>Camera Access Denied</Text>
                <Text style={styles.subErrorText}>Please enable camera permissions in your browser settings to scan products.</Text>
                <TouchableOpacity style={styles.retryButton} onPress={setupCamera}>
                    <Text style={styles.retryButtonText}>Retry Access</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (hasPermission === null) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#A0D39B" />
                <Text style={styles.loadingText}>Initializing Scanner...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.cameraSection}>
                <TouchableOpacity
                    activeOpacity={0.95}
                    onPress={capturePhoto}
                    style={styles.videoWrapper}
                >
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={webStyles.video}
                    />

                    {/* Reticle Overlay */}
                    <View style={styles.reticleContainer}>
                        <View style={styles.reticleBox}>
                            <View style={styles.cornerTL} />
                            <View style={styles.cornerTR} />
                            <View style={styles.scanLine} />
                            <View style={styles.cornerBL} />
                            <View style={styles.cornerBR} />
                        </View>
                    </View>

                    {/* Capture Button Overlay */}
                    <View style={styles.captureButtonContainer}>
                        <TouchableOpacity
                            style={styles.captureButtonOuter}
                            onPress={capturePhoto}
                            activeOpacity={0.7}
                        >
                            <View style={styles.captureButtonInner} />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const webStyles = {
    video: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    } as any
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    cameraSection: {
        flex: 1,
        width: '100%',
        position: 'relative',
        backgroundColor: '#000',
    },
    videoWrapper: {
        flex: 1,
        width: '100%',
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1B3022',
        padding: 24,
    },
    loadingText: {
        color: '#A0D39B',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 20,
        letterSpacing: 0.5,
    },
    errorIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    errorIcon: {
        fontSize: 40,
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    subErrorText: {
        color: '#A0D39B',
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.9,
        lineHeight: 22,
        marginBottom: 32,
    },
    retryButton: {
        backgroundColor: '#A0D39B',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    retryButtonText: {
        color: '#1B3022',
        fontSize: 16,
        fontWeight: '700',
    },
    instructionSection: {
        backgroundColor: '#1B3022',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -24, // Overlap camera section slightly for integrated look
        padding: 24,
        paddingTop: 16,
        flex: 1,
        minHeight: 250,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(247, 248, 247, 0.2)',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 24,
    },
    instructionHeader: {
        color: '#F7F8F7',
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 28,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    instructionStep: {
        flexDirection: 'row',
        marginBottom: 24,
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
    highlightText: {
        color: '#A0D39B',
        fontWeight: '600',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(160, 211, 155, 0.1)',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(160, 211, 155, 0.2)',
        marginTop: 8,
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
    captureButtonContainer: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        zIndex: 20,
    },
    captureButtonOuter: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 4,
        borderColor: '#F7F8F7',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    captureButtonInner: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: '#F7F8F7',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    reticleContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    reticleBox: {
        width: 250,
        height: 350,
        justifyContent: 'space-between',
        backgroundColor: 'rgba(160, 211, 155, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(160, 211, 155, 0.2)',
    },
    scanLine: {
        position: 'absolute',
        top: '50%',
        left: -10,
        right: -10,
        height: 2,
        backgroundColor: 'rgba(160, 211, 155, 0.8)',
        shadowColor: '#A0D39B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
    },
    cornerTL: { position: 'absolute', top: -2, left: -2, width: 30, height: 30, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#A0D39B', borderTopLeftRadius: 12 },
    cornerTR: { position: 'absolute', top: -2, right: -2, width: 30, height: 30, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#A0D39B', borderTopRightRadius: 12 },
    cornerBL: { position: 'absolute', bottom: -2, left: -2, width: 30, height: 30, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#A0D39B', borderBottomLeftRadius: 12 },
    cornerBR: { position: 'absolute', bottom: -2, right: -2, width: 30, height: 30, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#A0D39B', borderBottomRightRadius: 12 },
});
