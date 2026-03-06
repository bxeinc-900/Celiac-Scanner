import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface CameraScannerProps {
    onCapture: (photo: { path: string }) => void;
    isProcessing: boolean;
}

export const CameraScanner: FC<CameraScannerProps> = ({ onCapture, isProcessing }) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    useEffect(() => {
        setHasPermission(true);
    }, []);

    if (hasPermission === null) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Requesting...</Text>
            </View>
        );
    }

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => !isProcessing && onCapture({ path: 'mock.jpg' })}
            style={styles.container}
        >
            <View style={{ flex: 1, backgroundColor: '#D6CDB1', justifyContent: 'center', alignItems: 'center' }}>
                {/* Simulated Camera Feed Background matching the mockup's blurred background */}
                <Text style={{ color: '#4A5B4C', fontWeight: 'bold' }}>[ TAP TO SCAN PRODUCT ]</Text>

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
