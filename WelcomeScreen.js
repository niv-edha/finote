import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';

export default function WelcomeScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.logoArea}>
                    <Text style={styles.logoSymbolLeft}>📊</Text>
                    <Text style={styles.appName}>Finote</Text>
                    <Text style={styles.logoSymbolRight}>💰</Text>
                </View>
                <Text style={styles.tagline}>Your personal finance notebook.</Text>

                <TouchableOpacity 
                    style={styles.button}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.buttonText}>Get Started 🚀</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // NEW: Darker background for visual appeal
        backgroundColor: '#2c3e50', 
    },
    content: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 100,
    },
    logoArea: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    appName: {
        // NEW: Much larger font size
        fontSize: 88, 
        fontWeight: '900',
        color: '#f1c40f', // Gold/Yellow color
        letterSpacing: 2,
        paddingHorizontal: 5,
    },
    logoSymbolLeft: {
        fontSize: 40,
        transform: [{ rotate: '-15deg' }],
        marginRight: 10,
    },
    logoSymbolRight: {
        fontSize: 40,
        transform: [{ rotate: '15deg' }],
        marginLeft: 10,
    },
    tagline: {
        fontSize: 20,
        color: '#ecf0f1', // Light gray/white text
        marginBottom: 50,
        fontWeight: '600',
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
    buttonText: {
        fontSize: 22,
        color: '#fff',
        fontWeight: 'bold',
    }
});



