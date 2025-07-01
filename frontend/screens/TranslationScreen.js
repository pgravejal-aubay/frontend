// frontend/screens/TranslationScreen.js
import React, { useEffect, useContext } from 'react'; // 'useState' n'est plus nécessaire ici
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  Alert,
  Modal,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Sharing from 'expo-sharing';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppHeader from '../components/AppHeaders';
import {isLoggedIn } from '../services/authService'
import { AuthContext } from '../contexts/AuthContext';
import { SettingsContext } from '../contexts/SettingsContext';
import { addToHistory, saveTranslation } from '../services/storageService'; 
import { styles } from '../styles/translationStyles';

export default function TranslationScreen() {
  const { textSize } = useContext(AuthContext);
  const { voice, speechRate } = useContext(SettingsContext);

  const navigation = useNavigation();
  const route = useRoute();
  const { theme, setTheme } = useContext(SettingsContext);

  const { 
    originalText = "Texte original en attente...", 
    translatedText = "Traduction en cours...",
    sourceLang = "Unknown",
    targetLang = "Unknown",
  } = route.params || {};

  const getCurrentTranslationEntry = () => ({
    id: Date.now().toString(), // Un nouvel ID est généré si besoin. On pourrait aussi le passer en paramètre.
    originalText,
    translatedText,
    sourceLang,
    targetLang,
  });

  useEffect(() => {
    // On s'assure que les données ne sont pas les valeurs par défaut avant de sauvegarder.
    if (originalText && translatedText && originalText !== "Texte original en attente...") {
      addToHistory(getCurrentTranslationEntry());
    }
  }, [originalText, translatedText]); // Dépendances ajoutées


  const handleClose = () => {
    Speech.stop(); // Arrête la lecture si l'utilisateur quitte l'écran
    navigation.navigate('Home');
  };

  const handleReportError = () => {
    Alert.alert("Signaler une erreur", "Merci d'avoir signalé cette erreur. Nous allons l'examiner.");
  };

  const handleSpeak = async () => {
    const isSpeaking = await Speech.isSpeakingAsync();
    // Si le texte est déjà en cours de lecture, on l'arrête.
    if (isSpeaking) {
      await Speech.stop();
      return;
    }
    
    if (translatedText) {
      Speech.speak(translatedText, {
        language: 'fr-FR',
        voice: voice,       // Utilise la voix sélectionnée
        rate: speechRate,   // Utilise la vitesse sélectionnée
      });
    }
  };

  const handleSave = async () => {
    try {
      const logged = await isLoggedIn();
      if (!logged){
        showLoginAlert();
        return;
      }
      // On utilise les données actuelles pour la sauvegarde
      const isNewSave = await saveTranslation(getCurrentTranslationEntry());
      if (isNewSave) {
        Alert.alert("Enregistré", "La traduction a été sauvegardée.");
      } else {
        Alert.alert("Déjà enregistré", "Cette traduction est déjà dans vos favoris.");
      }
    } catch (e) {
      Alert.alert("Erreur", "La sauvegarde a échoué.");
      console.error("Failed to save from screen", e);
    }
  };

  const handleShare = async () => {
    if (translatedText && translatedText !== "Traduction en cours...") {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(translatedText);
      } else {
        Alert.alert("Erreur", "Le partage n'est pas disponible sur cet appareil.");
      }
    } 
  };

  const showLoginAlert = () => {
      Alert.alert(
          'Connexion requise',
          'Veuillez vous connecter pour continuer',
          [
          {
              text: 'Annuler',
              style: 'cancel',
          },
          {
              text: 'Se connecter',
              onPress: () => navigation.navigate('Login'),
          },
          ],
          { cancelable: true }
      );
      };

  return (
    <SafeAreaView style={styles(theme).container}>
      {/* Header fixe */}
      <AppHeader />

      <View style={styles(theme).mainContent}>
        <TouchableOpacity style={styles(theme).closeButton} onPress={handleClose}>
          <Ionicons name="close-circle" size={32} color="#ccc" />
        </TouchableOpacity>
        
        <View style={styles(theme).translationBox}>
          <ScrollView>
            <Text style={[styles(theme).translationText, { fontSize: 24 + textSize }]}>{translatedText}</Text>
          </ScrollView>
        </View>
      </View>

      <View style={styles(theme).footer}>
        <TouchableOpacity style={styles(theme).iconButton} onPress={handleReportError}>
          <Ionicons name="flag-outline" size={28} color="#000" />
        </TouchableOpacity>
        
        <View style={styles(theme).footerActionsRight}>
          <TouchableOpacity style={styles(theme).iconButton} onPress={handleSpeak}>
            <Ionicons name="volume-medium-outline" size={28} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles(theme).iconButton} onPress={handleSave}>
            <Feather name="download" size={28} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles(theme).iconButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={28} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
