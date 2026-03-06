import { useMemo } from 'react';
import type { FC } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';

interface AnalysisResult {
    status: 'SAFE' | 'UNSAFE' | 'UNCERTAIN';
    productName: string;
    brand?: string;
    ingredients?: string[];
    flaggedIngredients?: string[];
    warnings?: string[];
}

interface AnalysisOverlayProps {
    isVisible: boolean;
    isProcessing: boolean;
    result: AnalysisResult | null;
    onClose: () => void;
}

export const AnalysisOverlay: FC<AnalysisOverlayProps> = ({ isVisible, isProcessing, result, onClose }) => {
    // We want the card to float at the bottom of the camera view.
    const translateY = isVisible ? 0 : 500;

    const content = useMemo(() => {
        if (isProcessing) {
            return (
                <View style={[styles.cardContent, { alignItems: 'center', justifyContent: 'center', minHeight: 150 }]}>
                    <Text style={styles.scanningText}>Scanning Product...</Text>
                    <View style={styles.skeletonLine} />
                    <View style={styles.skeletonLineShort} />
                </View>
            );
        }

        if (result) {
            const isSafe = result.status === 'SAFE';
            const isUnsafe = result.status === 'UNSAFE';

            return (
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>
                        Product Scan: {result.productName}
                    </Text>

                    <View style={styles.resultRow}>
                        <View style={styles.iconContainer}>
                            {isSafe ? (
                                <ShieldCheck color="#FFFFFF" size={80} strokeWidth={1.5} />
                            ) : isUnsafe ? (
                                <ShieldAlert color="#FFFFFF" size={80} strokeWidth={1.5} />
                            ) : (
                                <ShieldQuestion color="#FFFFFF" size={80} strokeWidth={1.5} />
                            )}
                        </View>
                        <View style={styles.resultTextContainer}>
                            <Text style={styles.resultLabel}>Result:</Text>
                            <Text style={styles.resultValue}>
                                {isSafe ? 'Celiac Safe' : isUnsafe ? 'Unsafe' : 'Uncertain'}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.resultDescription}>
                        {isSafe
                            ? "AI scan confirms gluten-free ingredients and facility status."
                            : isUnsafe
                                ? "Contains gluten or high risk of cross-contamination."
                                : "Unable to verify. Proceed with caution."}
                    </Text>

                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Scan Another Product</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return null;
    }, [isProcessing, result, onClose]);

    return (
        <View
            style={[
                styles.container,
                {
                    transform: [{ translateY: translateY }] as any,
                    // @ts-ignore
                    transitionProperty: 'transform',
                    // @ts-ignore
                    transitionDuration: '300ms',
                    // @ts-ignore
                    transitionTimingFunction: 'ease-out'
                }
            ]}
        >
            {content}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#719568', // Rich green from mockup
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 24,
        paddingBottom: 40,
        elevation: 10,
        // Optional inner shadow/border for 3D effect shown in mockup
        borderTopWidth: 1,
        borderTopColor: '#88B27A',
        zIndex: 1000,
        ...Platform.select({
            web: {
                boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
            } as any
        })
    },
    cardContent: {
        // ...
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: '500',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 20,
        opacity: 0.95,
    },
    resultRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        gap: 20,
    },
    iconContainer: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        // In mockup it looks like a silver/metallic shield. 
        // We'll use a stylized dark background for the shield icon to make it pop.
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 50,
    },
    resultTextContainer: {
        flexDirection: 'column',
    },
    resultLabel: {
        fontSize: 18,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    resultValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        lineHeight: 40,
    },
    resultDescription: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.85,
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    scanningText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
    },
    skeletonLine: {
        height: 16,
        width: '80%',
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 8,
        marginVertical: 10,
    },
    skeletonLineShort: {
        height: 16,
        width: '50%',
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 8,
        marginVertical: 10,
    },
    closeButton: {
        marginTop: 24,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        alignSelf: 'center',
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    }
});
