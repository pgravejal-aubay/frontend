// frontend/screens/SettingsScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Picker } from '@react-native-picker/picker';
import { Separator } from '@/components/ui/separator';
import AppHeader from '../components/AppHeaders';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import { styles } from '../styles/SettingsStyle';
import { SettingsContext } from '../contexts/SettingsContext';
import { clearHistory,getHistoryEnabledStatus, setHistoryEnabledStatus } from '../services/storageService'; 
import { policyContent } from '../constants/policyContent'; 

const policyButtons = [
  { id: 1, label: 'Politique de confidentialité' },
  { id: 2, label: 'Conditions générales' },
  { id: 3, label: 'Mentions légales' },
];

// --- MODIFICATION ICI : On enlève les propriétés "alert" ---
const assistanceButtons = [
  { id: 1, label: 'Guide utilisateur' },
  { id: 2, label: 'Centre d\'assistance' },
  { id: 3, label: 'À propos de l\'équipe' },
];

const preferenceItems = [
  { id: 1, label: 'Clair/Sombre', type: 'switch', defaultChecked: true },
  { id: 2, label: 'Taille du texte', type: 'size-control' },
  { id: 3, label: 'Historique', type: 'switch', defaultChecked: true },
  { id: 4, label: 'Voix', type: 'picker' },
  { id: 5, label: 'Vitesse de lecture', type: 'picker' },
];

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { signOut, setTextSize, textSize } = useContext(AuthContext);
  const { voice, setVoice, speechRate, setSpeechRate, availableVoices, isHistoryEnabled, setHistoryEnabled } = useContext(SettingsContext);
  const { theme, setTheme } = useContext(SettingsContext);

  // --- NOUVELLE FONCTION UNIFIÉE ---
  // Gère la navigation pour les politiques, l'assistance et "À propos"
  const handleNavigation = (label) => {
    if (label === 'À propos de l\'équipe') {
      navigation.navigate('AboutTeam');
      return;
    }

    const data = policyContent[label];
    if (data) {
      navigation.navigate('Policy', { title: data.title, content: data.content });
    } else {
      console.log(`Aucun contenu trouvé pour le bouton : ${label}`);
      // Optionnel : afficher une alerte si le contenu n'est pas trouvé
      Alert.alert("Contenu non disponible", "Cette section n'est pas encore disponible.");
    }
  };

  const maleVoice = availableVoices.find(v => v.gender === 'male' || v.identifier.includes('-frb-') || v.identifier.includes('-frd-'));
  const femaleVoice = availableVoices.find(v => v.gender === 'female' || v.identifier.includes('-fra-') || v.identifier.includes('-frc-') || v.identifier.includes('-vlf-'));
  
  const handleTextSizeChange = (increment) => {
    const newOffset = textSize + (increment ? 2 : -2);
    if (newOffset >= -6 && newOffset <= 6) {
      setTextSize(newOffset);
    }
  };

  const handleHistoryToggle = (newValue) => {
    if (!newValue) {
      Alert.alert(
        "Désactiver l'historique",
        "Voulez-vous aussi vider l'historique?",
        [
          { text: "Annuler", style: "cancel" },
          { 
            text: "Juste Désactiver",
            onPress: () => {
              setHistoryEnabled(false);
            }
          },
          { 
            text: "Vider et Désactiver", 
            style: "destructive",
            onPress: async () => {
              await clearHistory();
              setHistoryEnabled(false);
              Alert.alert("Succès", "L'historique a été vidé.");
            }
          }
        ]
      );
    } else {
      setHistoryEnabled(true);
    }
  };

   return (
    <View style={styles(theme).container}>
      <AppHeader />
      <ScrollView>
        {/* Preferences Section */}
        <View style={styles(theme).section}>
          <Text style={[styles(theme).sectionTitle, { fontSize: 28 + textSize }]}>Préférences</Text>
          {preferenceItems.map((item) => (
            <View key={item.id} style={styles(theme).preferenceItem}>
              <Text style={[styles(theme).preferenceLabel, { fontSize: 22 + textSize }]}>{item.label}</Text>
              {item.type === 'switch' && item.label === 'Clair/Sombre' && (
                <Switch
                  value={theme === 'dark'}
                  onValueChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  trackColor={{ false: '#767577', true: '#6750a4' }}
                  thumbColor={'#f4f3f4'}
                />
              )}
              {item.type === 'switch' && item.label === 'Historique' && (
                item.label === 'Historique' ? (
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
                </View>
              )}
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
                  ) : null}
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
              // --- MODIFICATION ICI : On utilise la nouvelle fonction ---
              onPress={() => handleNavigation(button.label)}
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
              // --- MODIFICATION ICI : On utilise la nouvelle fonction ---
              onPress={() => handleNavigation(button.label)}
            >
              <Text style={[styles(theme).policyText, { fontSize: 16 + textSize }]}>{button.label}</Text>
            </Button>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;