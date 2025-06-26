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
import { styles } from '../styles/SettingsStyle';
import { SettingsContext } from '../contexts/SettingsContext';

const policyButtons = [
  { id: 1, label: 'Politique de confidentialité' },
  { id: 2, label: 'Conditions générales' },
  { id: 3, label: 'Mentions légales' },
];

const assistanceButtons = [
  { id: 1, label: 'Guide utilisateur' },
  { id: 2, label: 'Centre d\'assistance' },
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

  return (
    <View style={styles.container}>
      <AppHeader /> 
      <ScrollView>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 28 + textSize }]}>Préférences</Text>
          {preferenceItems.map((item) => (
            <View key={item.id} style={styles.preferenceItem}>
              <Text style={[styles.preferenceLabel, { fontSize: 22 + textSize }]}>{item.label}</Text>

              {item.type === 'switch' && ( <Switch defaultChecked={item.defaultChecked} trackColor={{ false: '#767577', true: '#6750a4' }} thumbColor={'#f4f3f4'}/> )}
              
              {item.type === 'size-control' && ( <View style={styles.sizeControl}>
                  <Button variant="ghost" size="icon" style={styles.sizeButton} onPress={() => handleTextSizeChange(false)}>
                    <Ionicons name="remove" size={16} color="black" style={styles.icon} />
                  </Button>
                  <Separator style={styles.separator} />
                  <Button variant="ghost" size="icon" style={styles.sizeButton} onPress={() => handleTextSizeChange(true)}>
                    <Ionicons name="add" size={16} color="black" style={styles.icon} />
                  </Button>
              </View> )}

              {item.type === 'picker' && (
                <View style={styles.pickerContainer}>
                  {item.label === 'Voix' ? (
                    <Picker selectedValue={voice} onValueChange={(v) => setVoice(v)} style={styles.picker} enabled={!!(maleVoice || femaleVoice)}>
                      {femaleVoice && <Picker.Item label="Femme" value={femaleVoice.identifier} />}
                      {maleVoice && <Picker.Item label="Homme" value={maleVoice.identifier} />}
                    </Picker>
                  ) : item.label === 'Vitesse de lecture' ? (
                    // <<< MODIFICATION FINALE : retour à x1 et x1.5 >>>
                    <Picker selectedValue={speechRate} onValueChange={(v) => setSpeechRate(parseFloat(v))} style={styles.picker}>
                        <Picker.Item label="x 1" value="1.0" />
                        <Picker.Item label="x 1.5" value="1.5" />
                    </Picker>
                  ) : (
                    <Picker style={styles.picker} selectedValue={localPickerValues[item.id]} onValueChange={(v) => setLocalPickerValues({ ...localPickerValues, [item.id]: v })}>
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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 28 + textSize }]}>Conditions et politiques</Text>
          {policyButtons.map((button) => (<Button key={button.id} variant="outline" style={styles.policyButton}><Text style={[styles.policyText, { fontSize: 16 + textSize }]}>{button.label}</Text></Button>))}
        </View>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 28 + textSize }]}>Assistance</Text>
          {assistanceButtons.map((button) => (<Button key={button.id} variant="outline" style={styles.policyButton}><Text style={[styles.policyText, { fontSize: 16 + textSize }]}>{button.label}</Text></Button>))}
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
