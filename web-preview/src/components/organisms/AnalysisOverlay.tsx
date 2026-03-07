import type { FC } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { ShieldCheck, ShieldAlert, ShieldQuestion, ExternalLink, X, Info, Save } from 'lucide-react';
import type { CeliacSafetyReport } from '../../services/ai_engine/celiacSafeReferenceEngine';

interface AnalysisOverlayProps {
    isVisible: boolean;
    isProcessing: boolean;
    result: CeliacSafetyReport | null;
    onClose: () => void;
    onSave: () => void;
}

export const AnalysisOverlay: FC<AnalysisOverlayProps> = ({ isVisible, isProcessing, result, onClose, onSave }) => {
    if (!isVisible) return null;

    const renderLoading = () => (
        <View style={styles.cardContent}>
            <ActivityIndicator size="large" color="#A0D39B" style={{ marginBottom: 30 }} />
            <Text style={styles.scanningText}>Sifting Ingredients...</Text>
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonLineShort} />
            <View style={styles.skeletonLine} />
            <Text style={styles.subText}>Nano Banana CoV Engine Active</Text>
        </View>
    );

    const renderReport = () => {
        if (!result) return null;

        const isSafe = result.status === 'Celiac Safe';
        const isUnsafe = result.status === 'Gluten Found';
        const isBlurry = result.status === 'Blurry Image';

        const themeColor = isSafe ? '#2ecc71' : isUnsafe ? '#ff7f50' : isBlurry ? '#95a5a6' : '#e67e22';

        return (
            <View style={styles.reportCard}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <X color="#FFF" size={24} />
                </TouchableOpacity>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={[styles.iconBadge, { backgroundColor: themeColor }]}>
                        {isSafe ? <ShieldCheck color="#FFF" size={48} /> :
                            isUnsafe ? <ShieldAlert color="#FFF" size={48} /> :
                                <ShieldQuestion color="#FFF" size={48} />}
                    </View>

                    <Text style={styles.statusText}>{result.status}</Text>
                    <Text style={styles.productName}>{result.brand} {result.productName}</Text>

                    <View style={styles.divider} />

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Info size={18} color="#A0D39B" />
                            <Text style={styles.sectionTitle}>Findings Report</Text>
                        </View>
                        <Text style={styles.summaryText}>{result.summary}</Text>
                    </View>

                    {result.flaggedIngredients.length > 0 && (
                        <View style={styles.warningBox}>
                            <Text style={styles.boxTitle}>⚠️ Flagged Ingredients</Text>
                            <Text style={styles.boxText}>{result.flaggedIngredients.join(', ')}</Text>
                        </View>
                    )}

                    {result.warnings.length > 0 && (
                        <View style={styles.cautionBox}>
                            <Text style={styles.boxTitle}>⚠️ Risk Alerts</Text>
                            {result.warnings.map((w, idx) => (
                                <Text key={idx} style={styles.boxText}>• {w}</Text>
                            ))}
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Trusted References</Text>
                        <View style={styles.referenceGrid}>
                            {result.references.map((ref, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.refChip}
                                    onPress={() => {
                                        const url = ref.startsWith('http') ? ref : `https://${ref}`;
                                        if (Platform.OS === 'web') window.open(url, '_blank');
                                    }}
                                >
                                    <Text style={styles.refText}>{ref}</Text>
                                    <ExternalLink size={12} color="#A0D39B" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
                            <Text style={styles.secondaryButtonText}>Close</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: themeColor }]} onPress={onSave}>
                            <Save size={18} color="#FFF" />
                            <Text style={styles.primaryButtonText}>Save to History</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {isProcessing ? renderLoading() : renderReport()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(10, 20, 12, 0.9)', // Deep forest glass
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        padding: 20
    },
    cardContent: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#1B3022',
        borderRadius: 24,
        width: '90%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    reportCard: {
        backgroundColor: '#1B3022',
        borderRadius: 24,
        width: '90%',
        maxWidth: 450,
        maxHeight: '85%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.14)',
        overflow: 'hidden',
        position: 'relative'
    },
    scrollContent: {
        padding: 24,
        alignItems: 'center'
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 20
    },
    iconBadge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    statusText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 4
    },
    productName: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 20
    },
    divider: {
        height: 1,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 20
    },
    section: {
        width: '100%',
        marginBottom: 20
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8
    },
    sectionTitle: {
        color: '#A0D39B',
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    summaryText: {
        color: '#FFF',
        fontSize: 16,
        lineHeight: 24,
        opacity: 0.9
    },
    warningBox: {
        width: '100%',
        backgroundColor: 'rgba(211, 47, 47, 0.15)',
        borderLeftWidth: 4,
        borderLeftColor: '#D32F2F',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16
    },
    cautionBox: {
        width: '100%',
        backgroundColor: 'rgba(230, 126, 34, 0.15)',
        borderLeftWidth: 4,
        borderLeftColor: '#e67e22',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16
    },
    boxTitle: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4
    },
    boxText: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 14,
        lineHeight: 20
    },
    referenceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 10
    },
    refChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    refText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600'
    },
    actionRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
        marginTop: 20
    },
    secondaryButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    secondaryButtonText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontWeight: 'bold'
    },
    primaryButton: {
        flex: 2,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    primaryButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold'
    },
    scanningText: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 30,
        letterSpacing: 0.5,
    },
    subText: {
        color: '#A0D39B',
        fontSize: 12,
        marginTop: 20,
        fontWeight: '600',
        opacity: 0.8
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
