// screens/ProcessingScreen.js

import React, { useEffect, useRef, useContext } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { checkTaskStatus, cancelTask } from '../services/uploadService';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { AuthContext } from '../contexts/AuthContext';
import { SettingsContext } from '../contexts/SettingsContext'
import { processingStyles as styles } from '../styles/processingStyles';

const ProcessingScreen = ({ route, navigation }) => {
    const { taskId } = route.params;
    const intervalRef = useRef(null);
    const { textSize } = useContext(AuthContext);
    const { theme, setTheme } = useContext(SettingsContext);

    const [fontsLoaded] = useFonts({
        'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    const handleCancel = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        navigation.navigate('Home');

        cancelTask(taskId).catch(error => {
            console.error("Échec de l'annulation de la tâche en arrière-plan :", error);
        });
    };

    const pollStatus = async () => {
        try {
            const response = await checkTaskStatus(taskId);
            if (response.status === 'completed') {
                clearInterval(intervalRef.current);
                console.log("DEBUG RESPONSE: ", response);
                
                const result = response.result; 
                navigation.replace('Translation', {
                    originalText: result.original_text,
                    translatedText: result.translated_text,
                    sourceLang: "German", // La langue source est fixe
                    targetLang: result.target_lang,
                });
            } else if (response.status === 'failed' || response.status === 'cancelled') {
                clearInterval(intervalRef.current);
                 Alert.alert("Échec", "Le traitement n'a pas pu être terminé.", [
                        { text: "OK", onPress: () => navigation.navigate('Home') }
                ]);
            }
        } catch (error) {
            console.error("Erreur de vérification:", error);
            clearInterval(intervalRef.current);
             Alert.alert("Erreur", "Impossible de contacter le serveur.", [
                        { text: "OK", onPress: () => navigation.navigate('Home') }
            ]);
        }
    };

    useEffect(() => {
        intervalRef.current = setInterval(pollStatus, 3000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [taskId]);

    if (!fontsLoaded) {
        return (
            <View style={styles(theme).container}>
                <ActivityIndicator size="large" color="#555" />
            </View>
        );
    }

    return (
        <View style={styles(theme).container}>
            <TouchableOpacity style={styles(theme).cancelButton} onPress={handleCancel}>
                <Ionicons name="close-circle" size={40} color="#cccccc" /> 
            </TouchableOpacity>

            <View style={styles(theme).content}>
                <ActivityIndicator size="large" color="#555" style={{ marginBottom: 40 }} />
                <Text style={[styles(theme).titleText, { fontSize: 32 + textSize }]}>
                    Génération de la{'\n'}
                    traduction en cours...
                </Text>
            </View>
        </View>
    );
};

export default ProcessingScreen;
