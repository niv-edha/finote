import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, SafeAreaView, TouchableOpacity, Alert } from 'react-native';

const CHARACTER_LOGOS = [
    { name: 'Frugal Fox', emoji: '🦊' },
    { name: 'Wise Owl', emoji: '🦉' },
    { name: 'Money Dragon', emoji: '🐉' },
    { name: 'Impulse Bunny', emoji: '🐰' },
];

export default function LoginScreen({ onLogin, navigation }) {
    const [name, setName] = useState('');
    const [selectedCharacter, setSelectedCharacter] = useState(CHARACTER_LOGOS[0]);

    const handleLogin = () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter your name.');
            return;
        }
        
        const profile = {
            name: name.trim(),
            character: selectedCharacter,
        };

        // 1. Save profile state in the parent App component
        onLogin(profile); 
        
        // 2. Manually navigate to the Home screen
        navigation.navigate('Home', { user: profile });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Your Financial Avatar</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Enter Your Name"
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.subtitle}>Choose Your Avatar:</Text>
                <View style={styles.avatarGrid}>
                    {CHARACTER_LOGOS.map((item) => (
                        <TouchableOpacity
                            key={item.name}
                            onPress={() => setSelectedCharacter(item)}
                            style={[
                                styles.avatarButton,
                                selectedCharacter.name === item.name && styles.avatarSelected,
                            ]}
                        >
                            <Text style={styles.avatarEmoji}>{item.emoji}</Text>
                            <Text style={styles.avatarText}>{item.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Button title={`Login as ${selectedCharacter.name}`} onPress={handleLogin} color="#007BFF" />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f4f4' },
    card: { flex: 1, backgroundColor: '#fff', margin: 20, padding: 30, borderRadius: 15, justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#007BFF' },
    input: { height: 50, borderColor: '#ccc', borderWidth: 1, paddingHorizontal: 15, marginBottom: 20, borderRadius: 8, fontSize: 18 },
    subtitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 30 },
    avatarButton: { padding: 10, margin: 5, borderRadius: 10, borderWidth: 2, borderColor: '#eee', alignItems: 'center', width: '40%' },
    avatarSelected: { borderColor: '#007BFF', backgroundColor: '#e6f0ff' },
    avatarEmoji: { fontSize: 30 },
    avatarText: { fontSize: 12, marginTop: 5, fontWeight: 'bold', color: '#555' },
});


