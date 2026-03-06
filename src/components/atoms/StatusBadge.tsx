import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
    status: 'SAFE' | 'UNSAFE' | 'UNCERTAIN' | 'SCANNING';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'SAFE':
                return '#50C878'; // Emerald
            case 'UNSAFE':
                return '#FF7F50'; // Coral
            case 'UNCERTAIN':
                return '#F6C90E'; // Yellow
            case 'SCANNING':
            default:
                return '#1B3022'; // Dark Green for loading states
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'SAFE': return 'Safe for Celiac';
            case 'UNSAFE': return 'Danger: Contains Gluten';
            case 'UNCERTAIN': return 'Uncertain: Manual Review Required';
            case 'SCANNING': return 'Analyzing Label...';
            default: return '';
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.text}>{getStatusText()}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 16,
    },
    text: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'System',
        letterSpacing: 0.5,
    },
});
