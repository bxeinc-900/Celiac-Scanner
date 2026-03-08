import { StyleSheet, View, Text } from 'react-native';
import { ChefHat } from 'lucide-react';

export const RecipesScreen = () => {
    return (
        <View style={styles.container}>
            <ChefHat color="#A0D39B" size={64} style={{ marginBottom: 20 }} />
            <Text style={styles.title}>Safe Recipes</Text>
            <Text style={styles.subtitle}>Delicious gluten-free recipes coming soon...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F8F3', // Light beige
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#2A422B',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#8E9AAF',
        textAlign: 'center',
    }
});
