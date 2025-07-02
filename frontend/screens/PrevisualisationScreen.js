// frontend/screens/VideoPreviewScreen.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Video } from 'expo-av'; // L'outil magique pour lire des vidéos
import { local_video } from '../services/uploadService'; // On importe le service d'upload

export default function VideoPreviewScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const [isLoading, setIsLoading] = React.useState(false);

    // On récupère les paramètres passés depuis HomeScreen
    const { videoUri, selectedPipeline, targetLanguage } = route.params;

    // Cette fonction contient la logique qui était AVANT dans HomeScreen
    const handleConfirmVideo = async () => {
        setIsLoading(true); // Affiche l'indicateur de chargement
        try {
            const videoAsset = {
                uri: videoUri,
                name: `recording-${Date.now()}.mp4`,
                mimeType: 'video/mp4',
            };
            const data = await local_video(videoAsset, selectedPipeline, targetLanguage, selectedPipeline);
            
            if (data.task_id) {
                // On navigue vers l'écran de traitement, en remplaçant l'écran actuel
                navigation.replace('Processing', { taskId: data.task_id });
            } else {
                Alert.alert('Erreur', data.message || "L'envoi a échoué, aucun ID de tâche reçu.");
                setIsLoading(false); // Cache l'indicateur en cas d'erreur
            }
        } catch (error) {
            console.error("Erreur d'envoi depuis la prévisualisation:", error);
            Alert.alert('Erreur', "Une erreur est survenue lors de l'envoi de la vidéo.");
            setIsLoading(false); // Cache l'indicateur en cas d'erreur
        }
    };

    // Fonction pour revenir en arrière
    const handleRetake = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Le lecteur vidéo qui prend tout l'écran */}
            <Video
                source={{ uri: videoUri }}
                style={StyleSheet.absoluteFill}
                shouldPlay={true}
                isLooping={true}
                resizeMode="contain"
            />

            {/* Overlay pour les boutons */}
            <View style={styles.controlsContainer}>
                <TouchableOpacity style={styles.button} onPress={handleRetake} disabled={isLoading}>
                    <Text style={styles.buttonText}>Reprendre</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleConfirmVideo} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Utiliser cette vidéo</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    controlsContainer: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
    },
    button: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#fff',
    },
    confirmButton: {
        backgroundColor: '#40e0d0', // Un vert pour confirmer
        borderColor: '#40e0d0',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});