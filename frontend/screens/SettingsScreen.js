

// frontend/screens/SettingsScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, ScrollView } from 'react-native';
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
// --- MODIFICATION ICI : On importe le bon fichier et la bonne variable ---
import { policyContent } from '../constants/policyContent'; 

const policyButtons = [
  { id: 1, label: 'Politique de confidentialité' },
  { id: 2, label: 'Conditions générales' },
  { id: 3, label: 'Mentions légales' },
];

const assistanceButtons = [
  { id: 1, label: 'Guide utilisateur' },
  { id: 2, label: 'Centre d\'assistance' },
  { id: 3, label: 'À propos de l\'équipe' },
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

  const handleNavigation = (label) => {
    if (label === 'À propos de l\'équipe') {
      navigation.navigate('AboutTeam');
    } else if (['Politique de confidentialité', 'Conditions générales', 'Mentions légales'].includes(label)) {
      navigation.navigate('Policy', { policy: label }); // Ajuste selon ta logique de navigation pour Policy
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

  const handlePolicyNavigation = (label) => {
    // --- MODIFICATION ICI : On utilise la bonne variable ---
    const data = policyContent[label];
    
    if (data) {
      navigation.navigate('Policy', { title: data.title, content: data.content });
    } else {
      console.log(`Pas de contenu trouvé pour le bouton: ${label}`);
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
                <Switch
                  defaultChecked={item.defaultChecked}
                  trackColor={{ false: '#767577', true: '#6750a4' }}
                  thumbColor={item.defaultChecked ? '#f4f3f4' : '#f4f3f4'}
                />
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