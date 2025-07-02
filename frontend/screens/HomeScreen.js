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
import AsyncStorage from '@react-native-async-storage/async-storage';

import { SettingsContext } from '../contexts/SettingsContext'
// Importe les styles locaux et le composant d'en-tête réutilisable
import { homeStyles as styles } from '../styles/homeStyles';
import AppHeader from '../components/AppHeaders';
import TutorialOverlay from '../components/TutorialOverlay';

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
    const [isDelaying, setIsDelaying] = useState(false);
    const [selectedPipeline, setSelectedPipeline] = useState('v1'); // 'v1' or 'v2'

    // Tutorial states
    const [isTutorialVisible, setTutorialVisible] = useState(false);
    const [elementLayouts, setElementLayouts] = useState({});
    const pipelinePickerRef = useRef(null);
    const flipCameraRef = useRef(null);
    const timerRef = useRef(null);
    const recordRef = useRef(null);
    const uploadRef = useRef(null);
    const infoRef = useRef(null);
 
    useEffect(() => {
        const checkTutorialStatus = async () => {
            try {
                const showTutorial = await AsyncStorage.getItem('showTutorial');
                const hasCompleted = await AsyncStorage.getItem('hasCompletedTutorial');
                if (showTutorial === 'true' && hasCompleted !== 'true') {
                    // Use a small delay to ensure UI is fully rendered before measuring
                    setTimeout(measureElements, 500); 
                }
            } catch (e) {
                console.error("Failed to check tutorial status", e);
            }
        };
        checkTutorialStatus();

        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, []);

    // tutorial steps
    const tutorialSteps = [
        { key: 'pipelinePicker', title: 'Sélecteur de Modèle', description: 'Choisissez le modèle de traduction que vous souhaitez utiliser. Le modèle V2 est plus récent et généralement plus performant.' },
        { key: 'flipCamera', title: 'Changer de Caméra', description: 'Basculez entre la caméra avant (pour vous filmer) et la caméra arrière.' },
        { key: 'timer', title: 'Retardateur', description: 'Déclenchez un compte à rebours de 3 secondes avant de commencer à enregistrer, pour avoir le temps de vous placer.' },
        { key: 'record', title: 'Enregistrer une Vidéo', description: 'Appuyez sur ce bouton pour démarrer l\'enregistrement. Appuyez à nouveau pour l\'arrêter et passer à la traduction.' },
        { key: 'upload', title: 'Importer une Vidéo', description: 'Sélectionnez une vidéo existante depuis la galerie de votre téléphone pour la traduire.' },
        { key: 'info', title: 'Informations', description: 'Obtenez des informations générales sur le fonctionnement de l\'application.' }
    ];

    const measureElements = () => {
        const refs = {
            pipelinePicker: pipelinePickerRef,
            flipCamera: flipCameraRef,
            timer: timerRef,
            record: recordRef,
            upload: uploadRef,
            info: infoRef,
        };
        const layouts = {};
        let measuredCount = 0;
        const totalElements = Object.keys(refs).length;

        Object.entries(refs).forEach(([key, ref]) => {
            if (ref.current) {
                ref.current.measureInWindow((x, y, width, height) => {
                    if (!isNaN(x) && !isNaN(y)) {
                        layouts[key] = { x, y, width, height };
                    }
                    measuredCount++;
                    if (measuredCount === totalElements) {
                        setElementLayouts(layouts);
                        setTutorialVisible(true);
                    }
                });
            } else {
                console.warn(`Tutorial: Ref for ${key} is not available.`);
                measuredCount++;
                if (measuredCount === totalElements) {
                    setElementLayouts(layouts);
                    if (Object.keys(layouts).length > 0) setTutorialVisible(true);
                }
            }
        });
    };

    const handleTutorialFinish = async () => {
        setTutorialVisible(false);
        try {
            await AsyncStorage.setItem('hasCompletedTutorial', 'true');
            await AsyncStorage.removeItem('showTutorial');
        } catch (e) {
            console.error("Failed to save tutorial completion state", e);
        }
    };
 
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
                    navigation.navigate('VideoPreview', {
                        videoUri: video.uri,
                        selectedPipeline: selectedPipeline,
                        targetLanguage: targetLanguage,
                    });
                    
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
                setIsImporting(false);
                return;
            }
        
            const asset = video.assets[0];
            const MAX_FILE_SIZE_MB = 1;
            const fileSizeInMB = (asset.size / 1000000).toFixed(2);

            if (fileSizeInMB > MAX_FILE_SIZE_MB) {
                Alert.alert('Fichier trop volumineux',
                    `La vidéo sélectionnée fait ${fileSizeInMB} MB. Veuillez sélectionner une vidéo de moins de ${MAX_FILE_SIZE_MB} MB.`
                );
                setIsImporting(false); 
                return;
            }

            navigation.navigate('VideoPreview', {
                videoUri: asset.uri, // On passe l'URI de la vidéo
                selectedPipeline: selectedPipeline,
                targetLanguage: targetLanguage,
            });
        } catch (error) {
            console.error('Error importing video:', error);
            Alert.alert('Erreur d\'importation', `Un problème est survenu: ${error.message || 'Erreur inconnue'}`);
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
            <View ref={pipelinePickerRef} style={[styles(theme).pickerContainer, {width: '90%', marginBottom: 10}]}>
                <Picker
                    selectedValue={selectedPipeline}
                    onValueChange={(itemValue) => setSelectedPipeline(itemValue)}
                    style={styles(theme).picker}
                    enabled={!isTutorialVisible}
                >
                    <Picker.Item label="Modèle V1 (POC2/MMPose)" value="v1" />
                    <Picker.Item label="Modèle V2 (MediaPipe/TwoStream)" value="v2" />
                </Picker>
            </View>
        </View>

        {/* Section des sélecteurs de langue */}
        <View style={styles(theme).pickerRow}>
            <View style={styles(theme).pickerContainer}>
                <Picker selectedValue={sourceLanguage} onValueChange={setSourceLanguage} style={styles(theme).picker} enabled={!isTutorialVisible}>
                    <Picker.Item label="Détection Auto" value="auto" />
                    <Picker.Item label="ASL" value="asl" />
                    <Picker.Item label="GSL" value="gsl" />
                </Picker>
            </View>
            <Icon name="arrow-forward" size={24} color="black" style={{ marginHorizontal: 10 }} />
            <View style={styles(theme).pickerContainer}>
                <Picker selectedValue={targetLanguage} onValueChange={setTargetLanguage} style={styles(theme).picker} enabled={!isTutorialVisible}>
                    <Picker.Item label="Français" value="fr" />
                    <Picker.Item label="English" value="en" />
                    <Picker.Item label="German" value="de" />
                </Picker>
            </View>
        </View>

        <View style={styles(theme).cameraPreview}>
            <CameraView 
                style={[StyleSheet.absoluteFill, { zIndex: 0 }]} 
                ref={cameraRef} 
                facing={facing} 
                mode="video" 
            />
            <View 
                style={[styles(theme).cameraOverlayContainer, { zIndex: 1 }]}
                pointerEvents="none"
            >
                <Image 
                    source={require('../assets/images/silouhette.png')}
                    style={styles(theme).cameraOverlayImage}
                />
            </View>
            {timer > 0 && 
                <View style={[styles(theme).timerOverlay, { zIndex: 2 }]}>
                    <Text style={styles(theme).timerText}>{timer}</Text>
                </View>
            }
        </View>
        
        {/* Section des contrôles */}
        <View style={styles(theme).controlsContainer}>
            <View style={styles(theme).sideControls}>
                <TouchableOpacity ref={flipCameraRef} style={styles(theme).controlButton} onPress={handleFlipCamera} disabled={isImporting || isRecording || isDelaying || isTutorialVisible}>
                    <Icon name="flip-camera-ios" size={28} color="black" />
                </TouchableOpacity>
                <TouchableOpacity ref={timerRef} style={styles(theme).controlButton} onPress={handleTimerPress} disabled={isImporting || isRecording || isDelaying || isTutorialVisible}>
                    <Icon name="timer" size={28} color="black" />
                </TouchableOpacity>
            </View>
            <TouchableOpacity ref={recordRef} style={styles(theme).recordButton} onPress={handleRecordPress}  disabled={isImporting || isDelaying || isTutorialVisible}>
                <View style={isRecording ? styles(theme).recordInnerRed : styles(theme).recordInnerWhite} />
            </TouchableOpacity>
            <View style={styles(theme).sideControls}>
                <TouchableOpacity ref={uploadRef} style={styles(theme).controlButton} onPress={importVideo} disabled={isImporting || isRecording || isDelaying || isTutorialVisible}>
                    <Icon name="file-upload" size={28} color="black" />
                </TouchableOpacity>
                <TouchableOpacity ref={infoRef} style={styles(theme).controlButton} onPress={handleInfoPress}  disabled={isImporting || isRecording || isDelaying || isTutorialVisible}>
                    <Icon name="info-outline" size={28} color="black" />
                </TouchableOpacity>
            </View>
        </View>

        <TutorialOverlay
            visible={isTutorialVisible}
            steps={tutorialSteps}
            layouts={elementLayouts}
            onFinish={handleTutorialFinish}
        />
    </View>
);
}