import { useState, useEffect, useRef, useCallback } from 'react';
import type { FC } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface CameraScannerProps {
    onCapture: (photo: { path: string }) => void;
    isProcessing: boolean;
}

export const CameraScanner: FC<CameraScannerProps> = ({ onCapture, isProcessing }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    useEffect(() => {
        async function setupCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setHasPermission(true);
            } catch (err) {
                console.error("Camera access denied:", err);
                setHasPermission(false);
            }
        }
        setupCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

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
                <Text style={styles.loadingText}>Camera Permission Denied</Text>
            </View>
        );
    }

    if (hasPermission === null) {
        return (
            <View style={styles.loadingContainer}>
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
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />

                {/* Reticle */}
                <View style={styles.reticleContainer}>
                    <View style={styles.reticleBox}>
                        <View style={styles.cornerTL} />
                        <View style={styles.cornerTR} />

                        {/* Horizontal scanning line animation mock */}
                        <View style={styles.scanLine} />

                        <View style={styles.cornerBL} />
                        <View style={styles.cornerBR} />
                    </View>
                </View>

            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1B3022',
    },
    loadingText: {
        color: '#F7F8F7',
        fontSize: 18,
        fontWeight: '600',
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
