// import React, { useState } from 'react';
// import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
// import { Audio } from 'expo-av';
// import { Ionicons, MaterialIcons, Feather, FontAwesome } from '@expo/vector-icons';
// import styles from '../styles/translationStyles';

// const TranslationScreen = ({ navigation }) => {
//   const [isOptionsVisible, setIsOptionsVisible] = useState(false);
//   const [translationText, setTranslationText] = useState('Voici la traduction qui s’affichera ici en texte scrollable.');

//   const handlePlaySound = async () => {
//     const soundObject = new Audio.Sound();
//     try {
//       await soundObject.loadAsync({ uri: 'https://example.com/audio.mp3' });
//       await soundObject.playAsync();
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleSave = () => {
//     navigation.navigate('HistoryScreen');
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.topButtons}>
//         <TouchableOpacity onPress={() => setIsOptionsVisible(!isOptionsVisible)}>
//           <Image source={require('../assets/images/icon.png')} style={styles.profileIcon} />
//         </TouchableOpacity>

//         <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
//           <Ionicons name="home" size={28} color="black" />
//         </TouchableOpacity>

//         <TouchableOpacity onPress={handleSave}>
//           <MaterialIcons name="save-alt" size={28} color="black" />
//         </TouchableOpacity>

//         <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')}>
//           <Feather name="settings" size={28} color="black" />
//         </TouchableOpacity>
//       </View>

//       {isOptionsVisible && (
//         <View style={styles.dropdownMenu}>
//           <TouchableOpacity onPress={() => console.log('Déconnexion')}>
//             <Text style={styles.dropdownItem}>Déconnexion du compte</Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => console.log('Suppression')}>
//             <Text style={styles.dropdownItem}>Suppression du compte</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       <ScrollView style={styles.textContainer}>
//         <Text style={styles.translatedText}>{translationText}</Text>
//       </ScrollView>

//       <View style={styles.bottomButtons}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="close-circle" size={32} color="black" style={styles.bottomIcon} />
//         </TouchableOpacity>

//         <TouchableOpacity onPress={() => console.log('Report issue')}>
//           <FontAwesome name="flag" size={28} color="red" style={styles.bottomIcon} />
//         </TouchableOpacity>

//         <TouchableOpacity onPress={handlePlaySound}>
//           <Ionicons name="volume-high" size={28} color="black" style={styles.bottomIcon} />
//         </TouchableOpacity>

//         <TouchableOpacity onPress={() => console.log('Téléchargement')}>
//           <Ionicons name="cloud-download" size={28} color="black" style={styles.bottomIcon} />
//         </TouchableOpacity>

//         <TouchableOpacity onPress={() => console.log('Partager')}>
//           <Ionicons name="share-social" size={28} color="black" style={styles.bottomIcon} />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default TranslationScreen;


// Dans screens/TranslationScreen.tsx

import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';

import { styles } from '../styles/translationStyles';

// --- MODIFICATION ICI : Texte de test très long ---
const longTestText = `Ceci est un test pour vérifier le défilement du texte. Le contenu qui suit est volontairement long pour s'assurer que la barre de défilement apparaît et fonctionne correctement lorsque le texte dépasse la taille de la boîte.

La traduction commence ici. Parfois, une conversation en langue des signes peut être très longue et détaillée, couvrant de nombreux sujets. Il est donc crucial que l'utilisateur puisse faire défiler l'intégralité du texte sans en perdre une seule partie.

Imaginez une histoire complexe, une recette de cuisine détaillée, ou les instructions pour assembler un meuble. Tout doit être accessible.

Ligne après ligne, le contenu s'allonge.
Ligne après ligne, le contenu s'allonge.
Ligne après ligne, le contenu s'allonge.
Ligne après ligne, le contenu s'allonge.
Ligne après ligne, le contenu s'allonge.
Ligne après ligne, le contenu s'allonge.
Ligne après ligne, le contenu s'allonge.
Ligne après ligne, le contenu s'allonge.
Ligne après ligne, le contenu s'allonge.
Ligne après ligne, le contenu s'allonge.

On y est presque... encore quelques lignes pour être absolument certain que le défilement est nécessaire sur tous les appareils, quelle que soit la taille de leur écran.

Le voyage à travers les mots continue, le défilement est notre guide.

Si vous pouvez lire cette phrase, cela signifie que vous avez réussi à faire défiler le texte jusqu'à la toute fin. Le test est donc un succès !`;


export default function TranslationScreen() {
  const navigation = useNavigation();

  const [translatedText, setTranslatedText] = useState(longTestText);

  const [isUserMenuVisible, setUserMenuVisible] = useState(false);

  // --- Fonctions pour les boutons ---

  const handleGoHome = () => {
    navigation.navigate('Video'); 
  };

  const handleGoToHistory = () => {
    navigation.navigate('History'); 
  };

  const handleGoToSettings = () => {
    navigation.navigate('Settings'); 
  };
  
  const handleClose = () => {
    navigation.navigate('Video');
  };
  
  const handleLogout = () => {
    setUserMenuVisible(false);
    Alert.alert("Déconnexion", "Vous avez été déconnecté.");
    navigation.navigate('Login');
  };

  const handleDeleteAccount = () => {
    setUserMenuVisible(false);
    Alert.alert(
      "Supprimer le compte",
      "Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: () => {
            console.log("Compte supprimé");
            navigation.navigate('Login');
          }
        }
      ]
    );
  };

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
    <SafeAreaView style={styles.container}>
      {/* --- Menu utilisateur (modal) --- */}
      <Modal
        transparent={true}
        visible={isUserMenuVisible}
        onRequestClose={() => setUserMenuVisible(false)}
        animationType="fade"
      >
        <TouchableOpacity style={{flex: 1}} onPressOut={() => setUserMenuVisible(false)}>
            <View style={styles.userMenu}>
                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                    <Text style={styles.menuItemText}>Déconnexion</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
                    <Text style={[styles.menuItemText, { color: 'red' }]}>Supprimer le compte</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
      </Modal>

      {/* --- Header --- */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setUserMenuVisible(true)}>
            <Ionicons name="person-outline" size={26} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleGoHome}>
            <Ionicons name="home-outline" size={26} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={handleGoToHistory}>
            <Ionicons name="bookmark-outline" size={26} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleGoToSettings}>
            <Ionicons name="settings-outline" size={26} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- Contenu Principal --- */}
      <View style={styles.mainContent}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close-circle" size={32} color="#ccc" />
        </TouchableOpacity>
        
        <View style={styles.translationBox}>
          <ScrollView>
            <Text style={styles.translationText}>{translatedText}</Text>
          </ScrollView>
        </View>
      </View>

      {/* --- Footer (Barre d'actions) --- */}
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
            <MaterialCommunityIcons name="share-outline" size={28} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}