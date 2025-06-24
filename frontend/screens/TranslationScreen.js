// frontend/screens/TranslationScreen.js

import React, { useState, useEffect } from 'react'; // NOUVEAU: import de useEffect
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

// NOUVEAU: Import des fonctions du service de stockage
import { addToHistory, saveTranslation } from '../services/storageService'; 
import { styles } from '../styles/translationStyles';

export default function TranslationScreen() {
  const handleClose = () => { navigation.navigate('Home'); };
  const navigation = useNavigation();
  const route = useRoute();

  // MODIFIÉ: On récupère toutes les informations de la traduction
  // Exemple de structure de route.params que vous devriez utiliser :
  // { originalText: "...", translatedText: "...", sourceLang: "German", targetLang: "French" }
  const { 
    originalText = "der winter ist vergangen im norden und schottland", 
    translatedText = "L'hiver est passé dans le nord et en Écosse",
    sourceLang = "German",
    targetLang = "French",
  } = route.params || {};

  // NOUVEAU: On crée un objet de traduction unique pour cette session
  const [translationEntry] = useState({
    id: Date.now().toString(), // ID unique basé sur le temps
    originalText,
    translatedText,
    sourceLang,
    targetLang,
  });

  // NOUVEAU: Utilisation de useEffect pour sauvegarder dans l'historique au chargement de l'écran
  useEffect(() => {
    // S'assure qu'on a bien une traduction à sauvegarder
    if (translationEntry.originalText && translationEntry.translatedText) {
      addToHistory(translationEntry);
    }
  }, []); // Le tableau vide signifie que cet effet ne s'exécute qu'une seule fois au montage

  const handleReportError = () => {
    Alert.alert("Signaler une erreur", "Merci d'avoir signalé cette erreur. Nous allons l'examiner.");
  };

  const handleSpeak = async () => {
    await Speech.stop(); 
    if (translatedText) {
      Speech.speak(translatedText, { language: 'fr-FR' });
    }
  };

  // MODIFIÉ: La fonction d'enregistrement est maintenant connectée au storageService
  const handleSave = async () => {
    try {
      const isNewSave = await saveTranslation(translationEntry);
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
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(translatedText);
    } else {
      Alert.alert("Erreur", "Le partage n'est pas disponible sur cet appareil.");
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
            {/* On peut afficher le texte original et le texte traduit */}
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