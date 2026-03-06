import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView, Dimensions } from 'react-native';
import { StatusBadge } from '../atoms/StatusBadge';

interface AnalysisResult {
    status: 'SAFE' | 'UNSAFE' | 'UNCERTAIN';
    productName: string;
    brand: string;
    ingredients: string[];
    flaggedIngredients: string[];
    warnings: string[];
}

interface AnalysisOverlayProps {
    isVisible: boolean;
    isProcessing: boolean;
    result: AnalysisResult | null;
    onClose: () => void;
}

const { height } = Dimensions.get('window');

export const AnalysisOverlay: React.FC<AnalysisOverlayProps> = ({ isVisible, isProcessing, result, onClose }) => {
    const slideAnim = useRef(new Animated.Value(height)).current;

    useEffect(() => {
        if (isVisible) {
            Animated.spring(slideAnim, {
                toValue: height * 0.3, // Slide up to cover bottom 70%
                useNativeDriver: true,
                bounciness: 8,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isVisible, slideAnim]);

    return (
        <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.dragHandle} />

            {isProcessing ? (
                <View style={styles.processingContainer}>
                    <StatusBadge status="SCANNING" />
                    <View style={styles.skeletonLine} />
                    <View style={styles.skeletonLineShort} />
                    <View style={styles.skeletonLine} />
                    <Text style={styles.scanningText}>Nano Banana CoV Initiated...</Text>
                </View>
            ) : result ? (
                <ScrollView style={styles.resultContainer} contentContainerStyle={{ paddingBottom: 40 }}>
                    <Text style={styles.productTitle}>{result.brand} - {result.productName}</Text>
                    <StatusBadge status={result.status} />

                    <Text style={styles.sectionTitle}>Verification Details</Text>

                    {result.warnings.length > 0 && (
                        <View style={styles.warningBox}>
                            <Text style={styles.warningTitle}>⚠️ Cross-Contamination Warning</Text>
                            {result.warnings.map((w, idx) => (
                                <Text key={idx} style={styles.warningText}>• {w}</Text>
                            ))}
                        </View>
                    )}

                    {result.flaggedIngredients.length > 0 && (
                        <View style={styles.flaggedBox}>
                            <Text style={styles.flaggedTitle}>Flagged Gluten Sources:</Text>
                            {result.flaggedIngredients.map((ing, idx) => (
                                <Text key={idx} style={styles.flaggedText}>• {ing}</Text>
                            ))}
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>Scanned Ingredients</Text>
                    <Text style={styles.ingredientsList}>{result.ingredients.join(', ')}</Text>

                    <Text onPress={onClose} style={styles.closeButton}>Scan Another Product</Text>
                </ScrollView>
            ) : null}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: height * 0.7,
        backgroundColor: '#F7F8F7', // Off-White motif
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: -5 },
        elevation: 20,
    },
    dragHandle: {
        width: 50,
        height: 6,
        backgroundColor: '#D1D5D1',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    processingContainer: {
        alignItems: 'center',
        paddingTop: 40,
    },
    scanningText: {
        color: '#1B3022',
        marginTop: 20,
        fontSize: 16,
        fontFamily: 'System',
        opacity: 0.7,
    },
    skeletonLine: {
        height: 16,
        width: '80%',
        backgroundColor: '#E0E5E0',
        borderRadius: 8,
        marginVertical: 10,
    },
    skeletonLineShort: {
        height: 16,
        width: '50%',
        backgroundColor: '#E0E5E0',
        borderRadius: 8,
        marginVertical: 10,
    },
    resultContainer: {
        flex: 1,
    },
    productTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1B3022',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1B3022',
        marginTop: 20,
        marginBottom: 8,
    },
    warningBox: {
        backgroundColor: '#FFEFE5',
        padding: 16,
        borderRadius: 12,
        marginVertical: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#FF7F50', // Coral
    },
    warningTitle: {
        color: '#FF7F50',
        fontWeight: '700',
        marginBottom: 4,
    },
    warningText: {
        color: '#552211',
        fontSize: 14,
    },
    flaggedBox: {
        backgroundColor: '#FCECEC',
        padding: 16,
        borderRadius: 12,
        marginVertical: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#D32F2F',
    },
    flaggedTitle: {
        color: '#D32F2F',
        fontWeight: '700',
        marginBottom: 4,
    },
    flaggedText: {
        color: '#5A1212',
        fontSize: 14,
    },
    ingredientsList: {
        color: '#4B5563',
        lineHeight: 22,
        fontSize: 14,
    },
    closeButton: {
        marginTop: 30,
        color: '#50C878', // Emerald
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 16,
    }
});
