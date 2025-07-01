// frontend/screens/HomeScreen.js
 
import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Button, Image } from 'react-native';import { CameraView, useCameraPermissions } from 'expo-camera';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import { Audio } from 'expo-av';
import { local_video } from '../services/uploadService';
import { AuthContext } from '../contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

import { SettingsContext } from '../contexts/SettingsContext'
// Importe les styles locaux et le composant d'en-tête réutilisable
import { homeStyles as styles } from '../styles/homeStyles';
import AppHeader from '../components/AppHeaders';

export default function HomeScreen({ navigation }) {
    const { textSize } = useContext(AuthContext);
    const [permission, requestPermission] = useCameraPermissions();
    // AJOUT : Hook pour la permission du microphone
    const [microphonePermission, requestMicrophonePermission] = Audio.usePermissions();
   
    const cameraRef = useRef(null);
    const { theme, setTheme } = useContext(SettingsContext);
 
    // États spécifiques à cet écran
    const [facing, setFacing] = useState('front');
    const [isRecording, setIsRecording] = useState(false);
    const [timer, setTimer] = useState(0);
    const timerIntervalRef = useRef(null);
    const [sourceLanguage, setSourceLanguage] = useState('auto');
    const [targetLanguage, setTargetLanguage] = useState('fr');
    const [isImporting, setIsImporting] = useState(false);
    const [isDelayting, setIsDelaying] = useState(false);
    const [selectedPipeline, setSelectedPipeline] = useState('v1'); // 'v1' or 'v2'

 
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
 
    // Similar modification for handleRecordPress if it calls local_video
    const handleRecordPress = async () => {
        if (!cameraRef.current) return;
        if (isRecording) {
            setIsRecording(false);
            cameraRef.current.stopRecording(); 
        } else {
            setIsRecording(true);
            try {
                const video = await cameraRef.current.recordAsync({ quality: '1080p' });
                setIsRecording(false);
                if (video && video.uri) {
                    const videoAsset = {
                        uri: video.uri,
                        name: `recording-${Date.now()}.mp4`,
                        mimeType: 'video/mp4',
                    };
                    const data = await local_video(videoAsset, selectedPipeline);
                    if (data.task_id) {
                        navigation.navigate('Processing', { taskId: data.task_id });
                    } else {
                        Alert.alert('Error', data.message || "Upload failed after recording, no task ID received.");
                    }
                    try {
                        const { status } = await MediaLibrary.requestPermissionsAsync();
                        if (status === 'granted') {
                            await MediaLibrary.createAssetAsync(video.uri);
                            console.log("Video saved to gallery.");
                        }
                    } catch (error) {
                        console.error("Erreur lors de la sauvegarde de la vidéo :", error);
                    }
                } else {
                     Alert.alert('Erreur', "L'enregistrement a échoué ou n'a pas retourné de vidéo.");
                }
            } catch (error) {
                console.error("Erreur d'enregistrement:", error);
                Alert.alert('Erreur', "Une erreur est survenue pendant l'enregistrement.");
                setIsRecording(false);
            }
        }
    };
   
    const importVideo = async () => {
        setIsImporting(true);
        try {
            const video = await DocumentPicker.getDocumentAsync({
                type: 'video/*',
                copyToCacheDirectory: true,
                multiple: false,
            });

            if (video.canceled) { 
                console.log("Stop importing video");
                return;
            }
        
            const asset = video.assets[0];
            const MAX_FILE_SIZE_MB = 1;
            const fileSizeInMB = (asset.size / 1000000).toFixed(2);

            if (fileSizeInMB > MAX_FILE_SIZE_MB) {
                Alert.alert('File too large',
                    `The selected video is ${fileSizeInMB} MB. Please select a video smaller than ${MAX_FILE_SIZE_MB} MB.`
                );
                return;
            }

            const data = await local_video(asset, selectedPipeline, targetLanguage, selectedPipeline);

            if (data.task_id) {
                navigation.navigate('Processing', { taskId: data.task_id });
            } else {
                Alert.alert('Error', data.message || "Upload failed, no task ID received.");
            }
        } catch (error) {
            console.error('Error importing video:', error);
            Alert.alert('Import Error', `An issue occurred: ${error.message || 'Unknown error'}`);
        } finally {
            setIsImporting(false);
        }
    };

    const handleInfoPress = () => Alert.alert("À propos de Hands Up", "Bonjour, cette application à pour objectif de traduire la langue des signes. Filmez le signeur ou uploadez une vidéo de celui-ci pour générer une traduction.");
 
    if (!permission || !microphonePermission) {
        return <View />;
    }
 
    if (!permission.granted || !microphonePermission.granted) {
        return (
            <View style={styles(theme).permissionContainer}>
                <Text style={[styles(theme).permissionText, { fontSize: 18 + textSize }]}>Nous avons besoin de votre permission...</Text>
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
 
    return (
    <View style={styles(theme).container}>
        <AppHeader />
        
        {/* Section des sélecteurs de modèle */}
        <View style={styles(theme).pickerRow}>
            <View style={[styles(theme).pickerContainer, {width: '90%', marginBottom: 10}]}>
                <Picker
                    selectedValue={selectedPipeline}
                    onValueChange={(itemValue) => setSelectedPipeline(itemValue)}
                    style={styles(theme).picker}
                >
                    <Picker.Item label="Modèle V1 (POC2/MMPose)" value="v1" />
                    <Picker.Item label="Modèle V2 (MediaPipe/TwoStream)" value="v2" />
                </Picker>
            </View>
        </View>

        {/* Section des sélecteurs de langue */}
        <View style={styles(theme).pickerRow}>
            <View style={styles(theme).pickerContainer}>
                <Picker selectedValue={sourceLanguage} onValueChange={setSourceLanguage} style={styles(theme).picker}>
                    <Picker.Item label="Détection Auto" value="auto" />
                    <Picker.Item label="ASL" value="asl" />
                    <Picker.Item label="GSL" value="gsl" />
                </Picker>
            </View>
            <Icon name="arrow-forward" size={24} color="black" style={{ marginHorizontal: 10 }} />
            <View style={styles(theme).pickerContainer}>
                <Picker selectedValue={targetLanguage} onValueChange={setTargetLanguage} style={styles(theme).picker}>
                    <Picker.Item label="Français" value="fr" />
                    <Picker.Item label="English" value="en" />
                    <Picker.Item label="German" value="de" />
                </Picker>
            </View>
        </View>

        {/* --- BLOC CAMÉRA ENTIÈREMENT CORRIGÉ --- */}
        <View style={styles(theme).cameraPreview}>
            {/* Couche 0 : La caméra, tout en bas */}
            <CameraView 
                style={[StyleSheet.absoluteFill, { zIndex: 0 }]} 
                ref={cameraRef} 
                facing={facing} 
                mode="video" 
            />

            {/* Couche 1 : La silhouette de cadrage, par-dessus la caméra */}
            <View 
                style={[styles(theme).cameraOverlayContainer, { zIndex: 1 }]}
                pointerEvents="none" // Permet aux clics de "passer à travers"
            >
                <Image 
                    source={require('../assets/images/silouhette.png')}
                    style={styles(theme).cameraOverlayImage}
                />
            </View>
            
            {/* Couche 2 : Le minuteur, par-dessus tout le reste */}
            {timer > 0 && 
                <View style={[styles(theme).timerOverlay, { zIndex: 2 }]}>
                    <Text style={styles(theme).timerText}>{timer}</Text>
                </View>
            }
        </View>
        
        {/* Section des contrôles */}
        <View style={styles(theme).controlsContainer}>
            <View style={styles(theme).sideControls}>
                <TouchableOpacity style={styles(theme).controlButton} onPress={handleFlipCamera} disabled={isImporting || isRecording || isDelayting}>
                    <Icon name="flip-camera-ios" size={28} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles(theme).controlButton} onPress={handleTimerPress} disabled={isImporting || isRecording || isDelayting}>
                    <Icon name="timer" size={28} color="black" />
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles(theme).recordButton} onPress={handleRecordPress}  disabled={isImporting || isDelayting}>
                <View style={isRecording ? styles(theme).recordInnerRed : styles(theme).recordInnerWhite} />
            </TouchableOpacity>
            <View style={styles(theme).sideControls}>
                <TouchableOpacity style={styles(theme).controlButton} onPress={importVideo} disabled={isImporting || isRecording || isDelayting}>
                    <Icon name="file-upload" size={28} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles(theme).controlButton} onPress={handleInfoPress}  disabled={isImporting || isRecording || isDelayting}>
                    <Icon name="info-outline" size={28} color="black" />
                </TouchableOpacity>
            </View>
        </View>
    </View>
);
}