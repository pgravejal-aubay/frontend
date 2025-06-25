// frontend/screens/TranslationScreen.js

import React, { useEffect } from 'react'; // 'useState' n'est plus nécessaire ici
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  Alert,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Sharing from 'expo-sharing';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppHeader from '../components/AppHeaders';

import { addToHistory, saveTranslation } from '../services/storageService'; 
import { styles } from '../styles/translationStyles';

export default function TranslationScreen() {
  const handleClose = () => { navigation.navigate('Home'); };
  const navigation = useNavigation();
  const route = useRoute();

  // Les paramètres sont extraits directement de la route.
  // Les valeurs par défaut sont utiles si on accède à l'écran pour un test.
  const { 
    originalText = "Texte original en attente...", 
    translatedText = "Traduction en cours...",
    sourceLang = "Unknown",
    targetLang = "Unknown",
  } = route.params || {};

  // BUG CORRIGÉ : L'objet de traduction est maintenant créé à la volée quand on en a besoin,
  // ou en utilisant les props directement. Le `useState` précédent ne se mettait pas à jour.
  const getCurrentTranslationEntry = () => ({
    id: Date.now().toString(), // Un nouvel ID est généré si besoin. On pourrait aussi le passer en paramètre.
    originalText,
    translatedText,
    sourceLang,
    targetLang,
  });

  // BUG CORRIGÉ : Le useEffect dépend maintenant des données de la traduction.
  // Il s'exécutera à chaque fois qu'une nouvelle traduction est reçue.
  useEffect(() => {
    // On s'assure que les données ne sont pas les valeurs par défaut avant de sauvegarder.
    if (originalText && translatedText && originalText !== "Texte original en attente...") {
      addToHistory(getCurrentTranslationEntry());
    }
  }, [originalText, translatedText]); // Dépendances ajoutées

  const handleReportError = () => {
    Alert.alert("Signaler une erreur", "Merci d'avoir signalé cette erreur. Nous allons l'examiner.");
  };

  const handleSpeak = async () => {
    await Speech.stop(); 
    if (translatedText && translatedText !== "Traduction en cours...") {
      Speech.speak(translatedText, { language: targetLang }); // Note : la langue devrait être dynamique
    }
  };

  const handleSave = async () => {
    try {
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

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />

      <View style={styles.mainContent}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close-circle" size={32} color="#ccc" />
        </TouchableOpacity>
        
        <View style={styles.translationBox}>
          <ScrollView>
            <Text style={styles.translationText}>{originalText}</Text>
            <View style={{height: 20}} />
            <Text style={[styles.translationText, {fontWeight: 'bold'}]}>{translatedText}</Text>
          </ScrollView>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.iconButton} onPress={handleReportError}>
          <Ionicons name="flag-outline" size={28} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.footerActionsRight}>
          <TouchableOpacity style={styles.iconButton} onPress={handleSpeak}>
            <Ionicons name="volume-medium-outline" size={28} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleSave}>
            <Feather name="download" size={28} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={28} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}