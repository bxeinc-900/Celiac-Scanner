import type { FC } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafetyCard } from './SafetyCard';
import type { CeliacSafetyReport } from '../../services/ai_engine/celiacSafeReferenceEngine';

interface ModalPanelProps {
    isVisible: boolean;
    report: CeliacSafetyReport | null;
    onClose: () => void;
    onSave: () => void;
}

export const ModalPanel: FC<ModalPanelProps> = ({ isVisible, report, onClose, onSave }) => {
    const translateY = isVisible ? 0 : 800;

    if (!report) return null;

    return (
        <View style={[styles.container, { transform: [{ translateY }] as any, transitionProperty: 'transform', transitionDuration: '400ms', transitionTimingFunction: 'ease-out' } as any]}>
            <View style={styles.handle} />
            <Text style={styles.headerTitle}>Verification Complete</Text>

            <SafetyCard report={report} />

            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
                    <Text style={styles.secondaryButtonText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={onSave}>
                    <Text style={styles.primaryButtonText}>Save to History</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
        elevation: 20,
        zIndex: 1500,
        ...Platform.select({
            web: {
                boxShadow: '0 -10px 30px rgba(0,0,0,0.2)',
            } as any
        })
    },
    handle: {
        width: 50,
        height: 5,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2A422B',
        textAlign: 'center',
        marginBottom: 24,
        opacity: 0.9,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16
    },
    secondaryButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#f1f2f6',
        alignItems: 'center'
    },
    secondaryButtonText: {
        color: '#2f3542',
        fontWeight: 'bold',
        fontSize: 16
    },
    primaryButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#2A422B', // Dark green motif
        alignItems: 'center'
    },
    primaryButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16
    }
});
