import { useState, useEffect, useRef, useCallback } from 'react';
import type { FC } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera as CameraIcon } from 'lucide-react';

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
    }, []);

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
                <View style={styles.videoWrapper}>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={webStyles.video}
                    />

                    {/* Top Pill Overlay */}
                    <View style={styles.topPillContainer}>
                        <View style={styles.pill}>
                            <CameraIcon color="#FFF" size={16} strokeWidth={2.5} style={{ marginRight: 6 }} />
                            <Text style={styles.pillText}>PHOTO IDENTIFY</Text>
                        </View>
                    </View>

                    {/* Reticle Overlay */}
                    <View style={styles.reticleContainer}>
                        <View style={styles.reticleBox}>
                            <View style={styles.cornerTL} />
                            <View style={styles.cornerTR} />
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
                </View>
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
    topPillContainer: {
        position: 'absolute',
        top: 24,
        alignSelf: 'center',
        zIndex: 20,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    pillText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
    },
    captureButtonContainer: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        zIndex: 20,
    },
    captureButtonOuter: {
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 6,
        borderColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    captureButtonInner: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: '#FFF',
        opacity: 0.9,
    },
    reticleContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    reticleBox: {
        width: 240,
        height: 240,
        justifyContent: 'space-between',
        position: 'relative',
    },
    cornerTL: { position: 'absolute', top: -0, left: -0, width: 30, height: 30, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#69D6B3' },
    cornerTR: { position: 'absolute', top: -0, right: -0, width: 30, height: 30, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#69D6B3' },
    cornerBL: { position: 'absolute', bottom: -0, left: -0, width: 30, height: 30, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#69D6B3' },
    cornerBR: { position: 'absolute', bottom: -0, right: -0, width: 30, height: 30, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#69D6B3' },
});
