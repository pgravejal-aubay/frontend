import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  Alert,
  Modal
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Sharing from 'expo-sharing';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppHeader from '../components/AppHeaders';
import { AuthContext } from '../contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { styles } from '../styles/translationStyles';

export default function TranslationScreen() {
  const { textSize } = useContext(AuthContext);
  const handleClose = () => { navigation.navigate('Home'); };
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useColorScheme() ?? 'light';

  const [translatedText, setTranslatedText] = useState(
    route.params?.translatedText || 'Le texte de la traduction apparaîtra ici.'
  );

  const handleReportError = () => {
    Alert.alert("Signaler une erreur", "Merci d'avoir signalé cette erreur. Nous allons l'examiner.");
  };

  const handleSpeak = async () => {
    await Speech.stop(); 
    if (translatedText) {
      Speech.speak(translatedText, { language: 'fr-FR' });
    }
  };

  const handleSave = () => {
    // Cette fonction correspond au bouton "télécharger" qui enregistre la traduction
    Alert.alert("Enregistré", "La traduction a été sauvegardée.");
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

