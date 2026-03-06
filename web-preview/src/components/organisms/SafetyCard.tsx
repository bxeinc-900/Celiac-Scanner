import type { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { CeliacSafetyReport } from '../../services/ai_engine/celiacSafeReferenceEngine';
import { ShieldCheck, ShieldAlert, ShieldQuestion, AlertTriangle } from 'lucide-react';

export const SafetyCard: FC<{ report: CeliacSafetyReport }> = ({ report }) => {
    const isSafe = report.status === 'Celiac Safe';
    const isUnsafe = report.status === 'Gluten Found';
    const isBlurry = report.status === 'Blurry Image';

    // Requirements map: 
    // If 'Gluten Found': Set theme to Coral Red
    // If 'Celiac Safe': Set theme to Emerald Green
    const themeColor = isSafe ? '#2ecc71' : isUnsafe ? '#ff7f50' : isBlurry ? '#95a5a6' : '#e67e22';

    return (
        <View style={[styles.card, { backgroundColor: themeColor }]}>
            <View style={styles.iconContainer}>
                {isSafe ? <ShieldCheck color="#FFF" size={60} strokeWidth={1.5} /> :
                    isUnsafe ? <ShieldAlert color="#FFF" size={60} strokeWidth={1.5} /> :
                        isBlurry ? <AlertTriangle color="#FFF" size={60} strokeWidth={1.5} /> :
                            <ShieldQuestion color="#FFF" size={60} strokeWidth={1.5} />}
            </View>
            <View style={styles.content}>
                <Text style={styles.status}>{report.status}</Text>
                {report.productName !== 'Unknown' && (
                    <Text style={styles.title}>{report.productName}</Text>
                )}
                <Text style={styles.summary}>{report.summary}</Text>

                {report.flaggedIngredients && report.flaggedIngredients.length > 0 && (
                    <Text style={styles.flags}>Triggers: {report.flaggedIngredients.join(', ')}</Text>
                )}

                <Text style={styles.certainty}>Certainty Rating: {report.certaintyRating}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 24,
        borderRadius: 20,
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 24
    },
    iconContainer: {
        marginBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 50,
        padding: 16,
    },
    content: { alignItems: 'center' },
    title: { color: '#FFF', fontSize: 18, fontWeight: '600', marginBottom: 6 },
    status: { color: '#FFF', fontSize: 28, fontWeight: '800', marginBottom: 12, textTransform: 'uppercase' },
    summary: { color: '#FFF', fontSize: 16, textAlign: 'center', marginBottom: 16, opacity: 0.95, lineHeight: 22 },
    flags: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginBottom: 12, backgroundColor: 'rgba(0,0,0,0.1)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
    certainty: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' }
});
