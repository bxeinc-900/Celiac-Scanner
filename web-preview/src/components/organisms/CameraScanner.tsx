import { useState, useEffect, useRef, useCallback } from 'react';
import type { FC } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

interface CameraScannerProps {
    onCapture: (photo: { path: string }) => void;
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
            onCapture({ path: dataUrl });
        }
    }, [onCapture, isProcessing]);

    if (hasPermission === false) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Camera Access Denied</Text>
                <Text style={styles.subErrorText}>Please enable camera permissions in your browser settings.</Text>
            </View>
        );
    }

    if (hasPermission === null) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#F7F8F7" />
                <Text style={styles.loadingText}>Requesting Camera Access...</Text>
            </View>
        );
    }

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={capturePhoto}
            style={styles.container}
        >
            <View style={styles.videoWrapper}>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={webStyles.video}
                />

                {/* Visual Overlay remains same */}
                <View style={styles.reticleContainer}>
                    <View style={styles.reticleBox}>
                        <View style={styles.cornerTL} />
                        <View style={styles.cornerTR} />
                        <View style={styles.scanLine} />
                        <View style={styles.cornerBL} />
                        <View style={styles.cornerBR} />
                    </View>
                    <Text style={styles.scanInstruction}>Align Ingredients and Tap to Scan</Text>
                </View>

                {/* Capture Button */}
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
        </TouchableOpacity>
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
        padding: 20,
    },
    loadingText: {
        color: '#F7F8F7',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    subErrorText: {
        color: '#A0D39B',
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.8,
    },
    scanInstruction: {
        position: 'absolute',
        top: 60,
        color: '#F7F8F7',
        fontSize: 16,
        fontWeight: '600',
        backgroundColor: 'rgba(27, 48, 34, 0.8)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        overflow: 'hidden',
    },
    captureButtonContainer: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        zIndex: 20,
    },
    captureButtonOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: '#F7F8F7',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F7F8F7',
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
        backgroundColor: 'rgba(113, 149, 104, 0.15)', // Light green tint
        borderWidth: 2,
        borderColor: 'rgba(113, 149, 104, 0.3)',
    },
    scanLine: {
        position: 'absolute',
        top: '50%',
        left: -10,
        right: -10,
        height: 2,
        backgroundColor: 'rgba(144, 238, 144, 0.8)',
        shadowColor: '#90EE90',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
    },
    cornerTL: { position: 'absolute', top: -4, left: -4, width: 40, height: 40, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#A0D39B', borderTopLeftRadius: 16 },
    cornerTR: { position: 'absolute', top: -4, right: -4, width: 40, height: 40, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#A0D39B', borderTopRightRadius: 16 },
    cornerBL: { position: 'absolute', bottom: -4, left: -4, width: 40, height: 40, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#A0D39B', borderBottomLeftRadius: 16 },
    cornerBR: { position: 'absolute', bottom: -4, right: -4, width: 40, height: 40, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#A0D39B', borderBottomRightRadius: 16 },
});
