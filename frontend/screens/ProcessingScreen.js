// screens/ProcessingScreen.js

import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { checkTaskStatus, cancelTask } from '../services/uploadService';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

import { processingStyles as styles } from '../styles/processingStyles';

const ProcessingScreen = ({ route, navigation }) => {
    const { taskId } = route.params;
    const intervalRef = useRef(null);

    const [fontsLoaded] = useFonts({
        'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    // --- C'EST LA SEULE FONCTION QUI A ÉTÉ MODIFIÉE ---
    const handleCancel = () => {
        // 1. On arrête de contacter le serveur pour vérifier le statut.
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // 2. On navigue IMMÉDIATEMENT vers la page vidéo.
        navigation.navigate('Video');

        // 3. On tente d'annuler la tâche sur le serveur en arrière-plan,
        //    sans que l'utilisateur ait à attendre ou voir un message.
        //    C'est une action de type "tire et oublie".
        cancelTask(taskId).catch(error => {
            console.error("Échec de l'annulation de la tâche en arrière-plan :", error);
        });
    };

    const pollStatus = async () => {
        try {
            const response = await checkTaskStatus(taskId);

            if (response.status === 'completed') {
                clearInterval(intervalRef.current);
                const translatedResult = response.result.translated_text;
                navigation.replace('Translation', {
                    translatedText: translatedResult,
                });
            } else if (response.status === 'failed' || response.status === 'cancelled') {
                clearInterval(intervalRef.current);
                 Alert.alert("Échec", "Le traitement n'a pas pu être terminé.", [
                        { text: "OK", onPress: () => navigation.navigate('Video') }
                ]);
            }
        } catch (error) {
            console.error("Erreur de vérification:", error);
            clearInterval(intervalRef.current);
             Alert.alert("Erreur", "Impossible de contacter le serveur.", [
                        { text: "OK", onPress: () => navigation.navigate('Video') }
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
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#555" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Ionicons name="close-circle" size={40} color="#cccccc" /> 
            </TouchableOpacity>

            <View style={styles.content}>
                <ActivityIndicator size="large" color="#555" style={{ marginBottom: 40 }} />
                <Text style={styles.titleText}>
                    Génération de la{'\n'}
                    traduction en cours...
                </Text>
            </View>
        </View>
    );
};

export default ProcessingScreen;
