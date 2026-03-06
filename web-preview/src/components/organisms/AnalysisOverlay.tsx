import type { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AnalysisOverlayProps {
    isVisible: boolean;
}

export const AnalysisOverlay: FC<AnalysisOverlayProps> = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <View style={styles.container}>
            <View style={styles.cardContent}>
                <Text style={styles.scanningText}>Sifting Ingredients...</Text>
                <View style={styles.skeletonLine} />
                <View style={styles.skeletonLineShort} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        backgroundColor: 'rgba(27, 48, 34, 0.85)', // Dark Green Motif
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    cardContent: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#1B3022',
        borderRadius: 20,
        width: '85%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    scanningText: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 30,
        letterSpacing: 0.5,
    },
    skeletonLine: {
        height: 16,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 8,
        marginVertical: 12,
        overflow: 'hidden',
    },
    skeletonLineShort: {
        height: 16,
        width: '60%',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 8,
        marginVertical: 12,
    }
});
