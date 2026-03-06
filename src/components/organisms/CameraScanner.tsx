import React, { useRef, useState, useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Camera, useCameraDevice, useCameraFormat, PhotoFile } from 'react-native-vision-camera';
import { ScannerButton } from '../atoms/ScannerButton';

interface CameraScannerProps {
    onCapture: (photo: PhotoFile) => void;
    isProcessing: boolean;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, isProcessing }) => {
    const device = useCameraDevice('back');
    const format = useCameraFormat(device, [
        { videoResolution: { width: 1920, height: 1080 } },
        { fps: 60 }
    ]);
    const cameraRef = useRef<Camera>(null);

    // State for providing helpful feedback in low light/blurry
    const [cameraFeedback, setCameraFeedback] = useState<string | null>(null);

    const handleCapture = useCallback(async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePhoto({
                    qualityPrioritization: 'quality',
                    flash: 'auto',
                    enableShutterSound: true,
                });

                // Simulating blur or low-light logic (implement real logic via frames if needed)
                // If image brightness too low, setCameraFeedback('Low Light Detected. Consider using flash.');

                onCapture(photo);
            } catch (error) {
                console.error('Failed to take photo', error);
            }
        }
    }, [onCapture]);

    if (device == null) return <View style={styles.loadingContainer}><Text style={styles.loadingText}>Loading Camera...</Text></View>;

    return (
        <View style={styles.container}>
            <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={!isProcessing}
                photo={true}
                format={format}
                enableZoomGesture={true}
            />

            {/* Minimalist Dark Green Scanning Reticle */}
            <View style={styles.reticleContainer}>
                <View style={styles.reticleBox}>
                    <View style={styles.cornerTL} />
                    <View style={styles.cornerTR} />
                    <View style={styles.cornerBL} />
                    <View style={styles.cornerBR} />
                </View>
                <Text style={styles.scanInstruction}>Align ingredient label within frame</Text>

                {cameraFeedback && (
                    <View style={styles.feedbackBadge}>
                        <Text style={styles.feedbackText}>{cameraFeedback}</Text>
                    </View>
                )}
            </View>

            <View style={styles.buttonContainer}>
                <ScannerButton onPress={handleCapture} isLoading={isProcessing} isDisabled={isProcessing} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1B3022',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F8F7',
    },
    loadingText: {
        color: '#1B3022',
        fontSize: 18,
        fontWeight: '600',
    },
    reticleContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reticleBox: {
        width: 250,
        height: 350,
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
    },
    scanInstruction: {
        marginTop: 20,
        color: '#F7F8F7',
        fontSize: 16,
        fontWeight: '600',
        backgroundColor: '#1B3022',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        overflow: 'hidden',
    },
    cornerTL: { position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#1B3022' },
    cornerTR: { position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#1B3022' },
    cornerBL: { position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#1B3022' },
    cornerBR: { position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#1B3022' },
    buttonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    feedbackBadge: {
        position: 'absolute',
        top: -50,
        backgroundColor: '#FF7F50', // Coral
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    feedbackText: {
        color: '#F7F8F7',
        fontWeight: 'bold',
    }
});
