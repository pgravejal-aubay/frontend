// frontend/screens/HomeScreen.js
 
import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import { Audio } from 'expo-av';
import { local_video } from '../services/uploadService';
import { AuthContext } from '../contexts/AuthContext';

// Importe les styles locaux et le composant d'en-tête réutilisable
import { homeStyles as styles } from '../styles/homeStyles';
import AppHeader from '../components/AppHeaders';
 
export default function HomeScreen({ navigation }) {
    const { textSize } = useContext(AuthContext);
    const [permission, requestPermission] = useCameraPermissions();
    // AJOUT : Hook pour la permission du microphone
    const [microphonePermission, requestMicrophonePermission] = Audio.usePermissions();
   
    const cameraRef = useRef(null);
 
    // États spécifiques à cet écran
    const [facing, setFacing] = useState('front');
    const [isRecording, setIsRecording] = useState(false);
    const [timer, setTimer] = useState(0);
    const timerIntervalRef = useRef(null);
    const [sourceLanguage, setSourceLanguage] = useState('auto');
    const [targetLanguage, setTargetLanguage] = useState('fr');
    const [isImporting, setIsImporting] = useState(false);
    const [isDelayting, setIsDelaying] = useState(false);

 
    useEffect(() => {
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, []);
 
    const handleFlipCamera = () => setFacing(current => (current === 'back' ? 'front' : 'back'));
 
    const handleTimerPress = () => {
        setIsDelaying(true)
        setTimer(3);
        timerIntervalRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timerIntervalRef.current);
                    setIsDelaying(false)
                    handleRecordPress();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };
 
    const handleRecordPress = async () => {
        if (!cameraRef.current) return;
        if (isRecording) {
            setIsRecording(false);
            cameraRef.current.stopRecording();
        } else {
            setIsRecording(true);
            cameraRef.current.recordAsync({ quality: '1080p' })
                .then(async (video) => {
                    console.log('Vidéo enregistrée dans le cache :', video.uri);
                    try {
                        const { status } = await MediaLibrary.requestPermissionsAsync();
                        if (status === 'granted') {
                            await MediaLibrary.createAssetAsync(video.uri);
                            Alert.alert('Vidéo enregistrée !', 'Votre vidéo a bien été sauvegardée dans la galerie.');
                        } else {
                            Alert.alert('Permission refusée', "Impossible de sauvegarder la vidéo sans l'accès à la galerie.");
                        }
                    } catch (error) {
                        console.error("Erreur lors de la sauvegarde de la vidéo :", error);
                        Alert.alert('Erreur', "Une erreur est survenue lors de la sauvegarde.");
                    }
                    navigation.navigate('Waiting', { videoUri: video.uri });
                })
                .catch(error => console.error("Erreur d'enregistrement:", error))
                .finally(() => setIsRecording(false));
        }
    };
   
    const importVideo = async () => {
        setIsImporting(true);
        try {
            const video = await DocumentPicker.getDocumentAsync({
            type: 'video/*',
            copyToCacheDirectory: true, // Recommended for reliability
            multiple: false,
            });

            if (video.canceled) { 
            console.log("Stop importing video");
            return;
            }
        
            const asset = video.assets[0];
            const MAX_FILE_SIZE_MB = 100;
            const fileSizeInMB = (asset.size / 1000000).toFixed(2);

            if (fileSizeInMB > MAX_FILE_SIZE_MB) {
            Alert.alert('File too large',
                `The selected video is ${fileSizeInMB} MB. Please select a video smaller than ${MAX_FILE_SIZE_MB} MB.`
            );
            return;
            }

            const data = await local_video(asset); 
            
            if (data.task_id) {
                navigation.navigate('Processing', { taskId: data.task_id });
            } else {
                Alert.alert('Error', data.message || "Upload failed, no task ID received.");
            }

        } catch (error) {
            console.error('Error importing video:', error);
            Alert.alert('Import Error', `An issue occurred: ${error.message}`);
        } finally {
            setIsImporting(false);
        }
    };

    const handleInfoPress = () => Alert.alert("À propos de Hands Up", "...");
 
    // MODIFIÉ : On attend que les DEUX permissions soient chargées
    if (!permission || !microphonePermission) {
        return <View />;
    }
 
    // MODIFIÉ : On vérifie si l'UNE ou l'AUTRE des permissions est manquante
    if (!permission.granted || !microphonePermission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={[styles.permissionText, { fontSize: 18 + textSize }]}>Nous avons besoin de votre permission...</Text>
                <Button
                    onPress={async () => {
                        await requestPermission();
                        await requestMicrophonePermission();
                    }}
                    title="Donner les permissions"
                />
            </View>
        );
    }
 
    // Rendu principal de la page
    return (
        <View style={styles.container}>
            <AppHeader />
            {/* Le reste de votre JSX reste identique... */}
            <View style={styles.pickerRow}>
                <View style={styles.pickerContainer}>
                    <Picker selectedValue={sourceLanguage} onValueChange={setSourceLanguage} style={styles.picker}>
                        <Picker.Item label="Détection Auto" value="auto" />
                        <Picker.Item label="ASL" value="asl" />
                        <Picker.Item label="GSL" value="gsl" />
                    </Picker>
                </View>
                <Icon name="arrow-forward" size={24} color="black" style={{ marginHorizontal: 10 }} />
                <View style={styles.pickerContainer}>
                    <Picker selectedValue={targetLanguage} onValueChange={setTargetLanguage} style={styles.picker}>
                        <Picker.Item label="Français" value="fr" />
                        <Picker.Item label="English" value="en" />
                        <Picker.Item label="German" value="de" />
                    </Picker>
                </View>
            </View>
 
            <View style={styles.cameraPreview}>
                <CameraView style={StyleSheet.absoluteFill} ref={cameraRef} facing={facing} mode="video" />
                {timer > 0 && <View style={styles.timerOverlay}><Text style={styles.timerText}>{timer}</Text></View>}
            </View>
            <View style={styles.controlsContainer}>
                <View style={styles.sideControls}>
                    <TouchableOpacity style={styles.controlButton} onPress={handleFlipCamera} disabled={isImporting || isRecording || isDelayting}><Icon name="flip-camera-ios" size={28} color="black" /></TouchableOpacity>
                    <TouchableOpacity style={styles.controlButton} onPress={handleTimerPress} disabled={isImporting || isRecording || isDelayting}><Icon name="timer" size={28} color="black" /></TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.recordButton} onPress={handleRecordPress}  disabled={isImporting || isDelayting}>
                    <View style={isRecording ? styles.recordInnerRed : styles.recordInnerWhite} />
                </TouchableOpacity>
                <View style={styles.sideControls}>
                    <TouchableOpacity style={styles.controlButton} onPress={importVideo} disabled={isImporting || isRecording || isDelayting}><Icon name="file-upload" size={28} color="black" /></TouchableOpacity>
                    <TouchableOpacity style={styles.controlButton} onPress={handleInfoPress}  disabled={isImporting || isRecording || isDelayting}><Icon name="info-outline" size={28} color="black" /></TouchableOpacity>
                </View>
            </View>
        </View>
    );
}