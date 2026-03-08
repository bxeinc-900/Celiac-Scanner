import type { FC } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { ShieldCheck, ShieldQuestion, ExternalLink, X, Info, Save, Skull } from 'lucide-react';
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

        const themeColor = isSafe ? '#2ecc71' : isUnsafe ? '#ff3b30' : isBlurry ? '#95a5a6' : '#e67e22';
        const cardBg = isUnsafe ? '#3d0808' : '#1B3022'; // Deep blood red vs deep forest green
        const accentColor = isUnsafe ? '#ff8a80' : '#A0D39B';

        return (
            <View style={[styles.reportCard, { backgroundColor: cardBg }]}>
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>Safety Analysis</Text>
                    <TouchableOpacity style={styles.closeIconButton} onPress={onClose}>
                        <X color="#FFF" size={24} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={[styles.iconBadge, { backgroundColor: themeColor }]}>
                        {isSafe ? <ShieldCheck color="#FFF" size={64} /> :
                            isUnsafe ? <Skull color="#FFF" size={64} /> :
                                <ShieldQuestion color="#FFF" size={64} />}
                    </View>

                    <Text style={[styles.statusText, { color: themeColor }]}>{result.status}</Text>
                    <Text style={styles.productName}>{result.brand} {result.productName}</Text>

                    <View style={styles.divider} />

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Info size={22} color={accentColor} />
                            <Text style={[styles.sectionTitle, { color: accentColor }]}>Detailed Findings</Text>
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
                        <Text style={[styles.sectionTitle, { color: accentColor }]}>Trusted References</Text>
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
                                    <ExternalLink size={14} color={accentColor} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: themeColor }]} onPress={onSave}>
                            <Save size={20} color="#FFF" />
                            <Text style={styles.primaryButtonText}>Capture to History</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
                            <Text style={styles.secondaryButtonText}>Back to Scanner</Text>
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
        backgroundColor: 'rgba(10, 20, 12, 1)', // Solid background for full-screen
        zIndex: 2000,
    },
    cardContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    reportCard: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    headerTitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 2
    },
    closeIconButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 100,
        alignItems: 'center'
    },
    iconBadge: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 10
    },
    statusText: {
        fontSize: 32,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 3,
        marginBottom: 8,
        textAlign: 'center'
    },
    productName: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 32,
        opacity: 0.8,
        paddingHorizontal: 20
    },
    divider: {
        height: 1,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 32
    },
    section: {
        width: '100%',
        marginBottom: 32
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1.5
    },
    summaryText: {
        color: '#FFF',
        fontSize: 18,
        lineHeight: 28,
        opacity: 0.95,
        textAlign: 'left'
    },
    warningBox: {
        width: '100%',
        backgroundColor: 'rgba(255, 59, 48, 0.15)',
        borderLeftWidth: 6,
        borderLeftColor: '#ff3b30',
        padding: 20,
        borderRadius: 16,
        marginBottom: 24
    },
    cautionBox: {
        width: '100%',
        backgroundColor: 'rgba(230, 126, 34, 0.15)',
        borderLeftWidth: 6,
        borderLeftColor: '#e67e22',
        padding: 20,
        borderRadius: 16,
        marginBottom: 24
    },
    boxTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8
    },
    boxText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 15,
        lineHeight: 24
    },
    referenceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 16
    },
    refChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.07)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    refText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600'
    },
    actionRow: {
        width: '100%',
        gap: 16,
        marginTop: 40
    },
    secondaryButton: {
        width: '100%',
        paddingVertical: 18,
        borderRadius: 16,
        backgroundColor: 'transparent',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    secondaryButtonText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 16,
        fontWeight: 'bold'
    },
    primaryButton: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8
    },
    primaryButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 1
    },
    scanningText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 40,
        letterSpacing: 1,
    },
    subText: {
        color: '#A0D39B',
        fontSize: 14,
        marginTop: 24,
        fontWeight: '600',
        opacity: 0.8
    },
    skeletonLine: {
        height: 20,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        marginVertical: 12,
    },
    skeletonLineShort: {
        height: 20,
        width: '60%',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        marginVertical: 12,
    }
});
