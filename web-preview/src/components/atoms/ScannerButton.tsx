import type { FC } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';

interface ScannerButtonProps {
    onPress: () => void;
    isLoading: boolean;
    isDisabled: boolean;
}

export const ScannerButton: FC<ScannerButtonProps> = ({ onPress, isLoading, isDisabled }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.button, isDisabled && styles.disabled]}
                onPress={onPress}
                disabled={isLoading || isDisabled}
                activeOpacity={0.8}
            >
                <View style={styles.innerCircle} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40,
    },
    button: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F7F8F7', // Off-White
        borderWidth: 6,
        borderColor: '#1B3022', // Dark Green motif
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 0,
    },
    innerCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#1B3022', // Dark Green motif
    },
    disabled: {
        opacity: 0.6,
    },
});
