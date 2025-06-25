// import React, { useState, useContext } from 'react';
// import { 
//   View, 
//   Text, 
//   TouchableOpacity, 
//   ScrollView, 
//   SafeAreaView, 
//   Alert,
//   Modal
// } from 'react-native';
// import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import * as Speech from 'expo-speech';
// import * as Sharing from 'expo-sharing';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import AppHeader from '../components/AppHeaders';
// import { AuthContext } from '../contexts/AuthContext';

// import { styles } from '../styles/translationStyles';

// export default function TranslationScreen() {
//   const { textSize } = useContext(AuthContext);
//   const handleClose = () => { navigation.navigate('Home'); };
//   const navigation = useNavigation();
//   const route = useRoute();

//   const [translatedText, setTranslatedText] = useState(
//     route.params?.translatedText || 'Le texte de la traduction apparaîtra ici.'
//   );

//   const handleReportError = () => {
//     Alert.alert("Signaler une erreur", "Merci d'avoir signalé cette erreur. Nous allons l'examiner.");
//   };

//   const handleSpeak = async () => {
//     await Speech.stop(); 
//     if (translatedText) {
//       Speech.speak(translatedText, { language: 'fr-FR' });
//     }
//   };

//   const handleSave = () => {
//     // Cette fonction correspond au bouton "télécharger" qui enregistre la traduction
//     Alert.alert("Enregistré", "La traduction a été sauvegardée.");
//   };

//   const handleShare = async () => {
//     const isAvailable = await Sharing.isAvailableAsync();
//     if (isAvailable) {
//       await Sharing.shareAsync(translatedText);
//     } else {
//       Alert.alert("Erreur", "Le partage n'est pas disponible sur cet appareil.");
//     } 
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header fixe */}
//       <AppHeader />

//       <View style={styles.mainContent}>
//         <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
//           <Ionicons name="close-circle" size={32} color="#ccc" />
//         </TouchableOpacity>
        
//         <View style={styles.translationBox}>
//           <ScrollView>
//             <Text style={[styles.translationText, { fontSize: 24 + textSize }]}>{translatedText}</Text>
//           </ScrollView>
//         </View>
//       </View>

//       <View style={styles.footer}>
//         <TouchableOpacity style={styles.iconButton} onPress={handleReportError}>
//           <Ionicons name="flag-outline" size={28} color="#000" />
//         </TouchableOpacity>
        
//         <View style={styles.footerActionsRight}>
//           <TouchableOpacity style={styles.iconButton} onPress={handleSpeak}>
//             <Ionicons name="volume-medium-outline" size={28} color="#000" />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.iconButton} onPress={handleSave}>
//             <Feather name="download" size={28} color="#000" />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
//             <Ionicons name="share-social-outline" size={28} color="#000" />
//           </TouchableOpacity>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }


// frontend/screens/TranslationScreen.js
import React, { useContext } from 'react';
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
import { AuthContext } from '../contexts/AuthContext';
// <<< AJOUT : Importer le contexte des paramètres >>>
import { SettingsContext } from '../contexts/SettingsContext';
import { styles } from '../styles/translationStyles';

export default function TranslationScreen() {
  const { textSize } = useContext(AuthContext);
  // <<< AJOUT : Utiliser le contexte des paramètres >>>
  const { voice, speechRate } = useContext(SettingsContext);

  const navigation = useNavigation();
  const route = useRoute();
  
  const translatedText = route.params?.translatedText || 'Le texte de la traduction apparaîtra ici.';

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
      // <<< MODIFICATION : Utiliser la voix et la vitesse du contexte >>>
      Speech.speak(translatedText, {
        language: 'fr-FR',
        voice: voice,       // Utilise la voix sélectionnée
        rate: speechRate,   // Utilise la vitesse sélectionnée
      });
    }
  };

  const handleSave = () => {
    Alert.alert("Enregistré", "La traduction a été sauvegardée dans votre historique.");
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
            <Text style={[styles.translationText, { fontSize: 24 + textSize }]}>{translatedText}</Text>
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
