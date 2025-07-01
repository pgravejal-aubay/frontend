// frontend/screens/SettingsScreen.js
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Picker } from '@react-native-picker/picker';
import { Separator } from '@/components/ui/separator';
import AppHeader from '../components/AppHeaders';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { styles } from '../styles/SettingsStyle';
import { SettingsContext } from '../contexts/SettingsContext';
import { clearHistory,getHistoryEnabledStatus, setHistoryEnabledStatus } from '../services/storageService'; 
// --- MODIFICATION ICI : On importe le bon fichier et la bonne variable ---
import { policyContent } from '../constants/policyContent'; 

const policyButtons = [
  { id: 1, label: 'Politique de confidentialité' },
  { id: 2, label: 'Conditions générales' },
  { id: 3, label: 'Mentions légales' },
];

const assistanceButtons = [
  {
    id: 1,
    label: 'Guide utilisateur',
    alertTitle: 'Guide Utilisateur', // New property
    alertMessage: `Bienvenue sur HandsUp ! Voici comment traduire une vidéo en quelques étapes simples :

1.  **Capturer ou Importer**
    *   **Filmer :** Utilisez le bouton d'enregistrement sur l'écran d'accueil. Pour de meilleurs résultats, assurez-vous que le signataire est bien éclairé, visible de face (visage, torse et mains), et que la vidéo est stable.
    *   **Importer :** Appuyez sur l'icône d'importation pour choisir une vidéo depuis votre galerie. La vidéo ne doit pas dépasser 100 Mo.

2.  **Lancer la Traduction**
    Une fois la vidéo enregistrée ou sélectionnée, le traitement commence automatiquement. Cela peut prendre un petit moment.

3.  **Découvrir le Résultat**
    Le texte traduit s'affiche à l'écran. Vous pouvez alors :
    *   🔊 **Écouter** la traduction grâce à la synthèse vocale.
    *   💾 **Sauvegarder** le résultat dans votre historique.
    *   🔗 **Partager** le texte avec d'autres applications.

Bonnes traductions !`
  },
  {
    id: 2,
    label: 'Centre d\'assistance',
    alertTitle: 'Centre d\'Assistance', // New property
    alertMessage: `Vous rencontrez un problème ? Voici quelques solutions aux questions fréquentes.

• **La traduction est incorrecte ou vide ?**
La qualité de la vidéo est essentielle. Essayez de filmer à nouveau avec un meilleur éclairage et un cadrage plus large. Vous pouvez aussi essayer l'autre modèle de traduction (V1/V2) sur l'écran d'accueil. Si le problème persiste, utilisez l'icône "drapeau" 🚩 sur l'écran de résultat pour nous signaler l'erreur.

• **L'application est lente ?**
Le traitement vidéo demande beaucoup de ressources. Assurez-vous d'avoir une bonne connexion internet, surtout pour l'importation de vidéos.

• **Besoin de plus d'aide ?**
Si votre problème n'est pas résolu, contactez notre support par email à : support@handsup.app

Merci de nous aider à améliorer l'application !`
  },
];

const preferenceItems = [
  { id: 1, label: 'Clair/Sombre', type: 'switch', defaultChecked: true },
  { id: 2, label: 'Taille du texte', type: 'size-control' },
  { id: 3, label: 'Langue cible', type: 'picker', options: [
    { value: 'default', label: 'Choisir la langue' },
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
  ] },
  { id: 4, label: 'Historique', type: 'switch', defaultChecked: true },
  { id: 5, label: 'Voix', type: 'picker' },
  { id: 6, label: 'Vitesse de lecture', type: 'picker' },
];

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { signOut, setTextSize, textSize } = useContext(AuthContext);
  const { voice, setVoice, speechRate, setSpeechRate, availableVoices } = useContext(SettingsContext);
  
  const [localPickerValues, setLocalPickerValues] = useState({
      3: 'fr',
  });
  const theme = useColorScheme() ?? 'light';

  const handleLogout = async () => {
    await signOut();
  };

  const maleVoice = availableVoices.find(v => v.gender === 'male' || v.identifier.includes('-frb-') || v.identifier.includes('-frd-'));
  const femaleVoice = availableVoices.find(v => v.gender === 'female' || v.identifier.includes('-fra-') || v.identifier.includes('-frc-') || v.identifier.includes('-vlf-'));
  
  const handleTextSizeChange = (increment) => {
    const newOffset = textSize + (increment ? 2 : -2);
    if (newOffset >= -6 && newOffset <= 6) {
      setTextSize(newOffset);
    }
  };

  const [isHistoryEnabled, setIsHistoryEnabled] = useState(true);

  // Load the history enabled status when the component mounts
  // This ensures we respect the user's previous choice
  useEffect(() => {
    const loadStatus = async () => {
      const status = await getHistoryEnabledStatus();
      setIsHistoryEnabled(status);
    };
    loadStatus();
  }, []);

  const handleHistoryToggle = (newValue) => {
    // Cas 1 : L'utilisateur veut ACTIVER l'historique.
    if (newValue) {
      // Action simple : on met à jour l'UI et on sauvegarde.
      setIsHistoryEnabled(true);
      setHistoryEnabledStatus(true);
    } 
    // Cas 2 : L'utilisateur veut DÉSACTIVER l'historique.
    else {
      // On affiche l'alerte SANS CHANGER L'ÉTAT de l'UI pour le moment.
      // Le switch reste visuellement "activé" pendant que l'alerte est affichée.
      Alert.alert(
        "Désactiver l'historique",
        "Voulez-vous aussi vider l'historique et les favoris ?",
        [
          { 
            text: "Annuler", 
            style: "cancel",
            // Si l'utilisateur annule, on ne fait absolument rien. L'état `isHistoryEnabled`
            // est toujours `true`, donc le switch reste bien activé.
          },
          { 
            text: "Juste Désactiver",
            onPress: async () => {
              // Action : Désactiver sans vider.
              await setHistoryEnabledStatus(false);
              setIsHistoryEnabled(false);
            }
          },
          { 
            text: "Vider et Désactiver", 
            style: "destructive",
            onPress: async () => {
              // Action : Vider ET désactiver.
              await clearHistory();
              await setHistoryEnabledStatus(false);
              setIsHistoryEnabled(false);
              Alert.alert("Succès", "L'historique et les favoris ont été vidés.");
            }
          }
        ]
      );
    }
  };

  return (
    <View style={styles(theme).container}>
      {/* Header fixe */}
      <AppHeader />

      {/* Contenu défilant */}
      <ScrollView>

        {/* Preferences Section */}
        <View style={styles(theme).section}>
          <Text style={[styles(theme).sectionTitle, { fontSize: 28 + textSize }]}>Préférences</Text>
          {preferenceItems.map((item) => (
            <View key={item.id} style={styles(theme).preferenceItem}>
              <Text style={[styles(theme).preferenceLabel, { fontSize: 22 + textSize }]}>{item.label}</Text>

              {item.type === 'switch' && (
                item.label === 'Historique' ? (
                  // Si le label est "Historique", on utilise la logique dédiée
                  <Switch
                    value={isHistoryEnabled}
                    onValueChange={handleHistoryToggle}
                    trackColor={{ false: '#767577', true: '#6750a4' }}
                    thumbColor={'#f4f3f4'}
                  />
                ) : (
                  <Switch
                    defaultChecked={item.defaultChecked}
                    trackColor={{ false: '#767577', true: '#6750a4' }}
                    thumbColor={item.defaultChecked ? '#f4f3f4' : '#f4f3f4'}
                  />
                )
              )}
              {item.type === 'size-control' && (
                <View style={styles(theme).sizeControl}>
                  <Button variant="ghost" size="icon" style={styles(theme).sizeButton} onPress={() => handleTextSizeChange(false)}>
                    <Ionicons name="remove" size={16} color="black" style={styles(theme).icon} />
                  </Button>
                  <Separator style={styles(theme).separator} />
                  <Button variant="ghost" size="icon" style={styles(theme).sizeButton} onPress={() => handleTextSizeChange(true)}>
                    <Ionicons name="add" size={16} color="black" style={styles(theme).icon} />
                  </Button>
              </View> )}

              {item.type === 'picker' && (
                <View style={styles(theme).pickerContainer}>
                  {item.label === 'Voix' ? (
                    <Picker selectedValue={voice} onValueChange={(v) => setVoice(v)} style={styles.picker} enabled={!!(maleVoice || femaleVoice)}>
                      {femaleVoice && <Picker.Item label="Femme" value={femaleVoice.identifier} />}
                      {maleVoice && <Picker.Item label="Homme" value={maleVoice.identifier} />}
                    </Picker>
                  ) : item.label === 'Vitesse de lecture' ? (
                    <Picker selectedValue={speechRate} onValueChange={(v) => setSpeechRate(parseFloat(v))} style={styles.picker}>
                        <Picker.Item label="x 1" value="1.0" />
                        <Picker.Item label="x 1.5" value="1.5" />
                    </Picker>
                  ) : (
                    <Picker style={styles(theme).picker} selectedValue={localPickerValues[item.id]} onValueChange={(v) => setLocalPickerValues({ ...localPickerValues, [item.id]: v })}>
                      {item.options?.map((option) => (
                        <Picker.Item key={option.value} label={option.label} value={option.value} />
                      ))}
                    </Picker>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Conditions and Policies Section */}
        <View style={styles(theme).section}>
          <Text style={[styles(theme).sectionTitle, { fontSize: 28 + textSize }]}>Conditions et politiques</Text>
          {policyButtons.map((button) => (
            <Button 
              key={button.id} 
              variant="outline" 
              style={styles(theme).policyButton}
              onPress={() => handlePolicyNavigation(button.label)}
            >
              <Text style={[styles(theme).policyText, { fontSize: 16 + textSize }]}>{button.label}</Text>
            </Button>
          ))}
        </View>
        {/* Assistance Section */}
        <View style={styles(theme).section}>
          <Text style={[styles(theme).sectionTitle, { fontSize: 28 + textSize }]}>Assistance</Text>
          {assistanceButtons.map((button) => (
            <Button
              key={button.id}
              variant="outline"
              style={styles(theme).policyButton}
              onPress={() => Alert.alert(button.alertTitle, button.alertMessage)}
            >
              <Text style={[styles.policyText, { fontSize: 16 + textSize }]}>{button.label}</Text>
            </Button>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
