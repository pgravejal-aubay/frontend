// frontend/screens/SettingsScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Picker } from '@react-native-picker/picker';
import { Separator } from '@/components/ui/separator';
import { Feather, Ionicons } from '@expo/vector-icons'; // Remplace lucide-react
import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Définir les types de navigation
type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Login: undefined;
  Register: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Define data for repeating elements
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
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Português' },
    { value: 'zh', label: '中文 (Chinese)' },
    { value: 'ja', label: '日本語 (Japanese)' },
    { value: 'ru', label: 'Русский (Russian)' },
  ] },
  { id: 4, label: 'Historique', type: 'switch', defaultChecked: true },
  { id: 5, label: 'Voix', type: 'picker', options: [{ value: 'homme', label: 'Homme' }, { value: 'femme', label: 'Femme' }] },
  { id: 6, label: 'Vitesse de lecture', type: 'picker', options: [{ value: 'x1', label: 'x 1' }, { value: 'x2', label: 'x 2' }] },
];

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { signOut } = useContext(AuthContext);

  const handleLogout = async () => {
    await signOut();
    // La navigation vers Login sera gérée par App.tsx
  };

  // État pour chaque Picker
  const [selectedValues, setSelectedValues] = useState<{ [key: number]: string }>({
    3: 'fr', // Langue cible
    5: 'homme', // Voix
    6: 'x1', // Vitesse de lecture
  });

  return (
    <View style={styles.container}>
      {/* Navigation Icons */}
      <View style={styles.navIcons}>
        <TouchableOpacity onPress={() => console.log('User icon pressed')}>
          <Feather name="user" size={48} color="black" style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          console.log('Navigating to Home');
          navigation.navigate('Home');
        }}>
          <Feather name="home" size={48} color="black" style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log('Bookmark icon pressed')}>
          <Feather name="bookmark" size={48} color="black" style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log('Settings icon pressed')}>
          <Feather name="settings" size={48} color="black" style={styles.navIcon} />
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Préférences</Text>
        {preferenceItems.map((item) => (
          <View key={item.id} style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>{item.label}</Text>
            {item.type === 'switch' && (
              <Switch
                defaultChecked={item.defaultChecked}
                trackColor={{ false: '#767577', true: '#6750a4' }}
                thumbColor={item.defaultChecked ? '#f4f3f4' : '#f4f3f4'}
              />
            )}
            {item.type === 'size-control' && (
              <View style={styles.sizeControl}>
                <Button variant="ghost" size="icon" style={styles.sizeButton}>
                  <Feather name="minus" size={16} color="black" style={styles.icon} />
                </Button>
                <Separator style={styles.separator} />
                <Button variant="ghost" size="icon" style={styles.sizeButton}>
                  <Feather name="plus" size={16} color="black" style={styles.icon} />
                </Button>
              </View>
            )}
            {item.type === 'picker' && (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedValues[item.id]}
                  onValueChange={(value) => setSelectedValues({ ...selectedValues, [item.id]: value })}
                  style={styles.picker}
                >
                  {item.options?.map((option) => (
                    <Picker.Item key={option.value} label={option.label} value={option.value} />
                  ))}
                </Picker>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Conditions and Policies Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conditions et politiques</Text>
        {policyButtons.map((button) => (
          <Button key={button.id} variant="outline" style={styles.policyButton}>
            <Text style={styles.policyText}>{button.label}</Text>
          </Button>
        ))}
      </View>

      {/* Assistance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assistance</Text>
        {assistanceButtons.map((button) => (
          <Button key={button.id} variant="outline" style={styles.policyButton}>
            <Text style={styles.policyText}>{button.label}</Text>
          </Button>
        ))}
      </View>

      {/* Logout Button */}
      <View style={styles.logoutButtonContainer}>
        <Button title="Déconnexion" onPress={handleLogout} color="red" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  statusBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 5 },
  time: { fontSize: 16 },
  statusIcons: { flexDirection: 'row', gap: 8 },
  icon: { width: 16, height: 16 },
  navIcons: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  navIcon: { width: 48, height: 48 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 28, fontWeight: '700', marginBottom: 16 },
  preferenceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  preferenceLabel: { fontSize: 22 },
  sizeControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e5e5e5', borderRadius: 8, padding: 4 },
  sizeButton: { padding: 0 },
  separator: { width: 1, height: 12, backgroundColor: '#a0a0a0' },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, width: 168 },
  picker: { height: 50, width: '100%' },
  policyButton: { height: 32, borderRadius: 8, borderColor: '#cac4d0', shadowColor: '#00000040', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 4, marginBottom: 8 },
  policyText: { fontSize: 14, color: '#49454f', textAlign: 'center' },
  logoutButtonContainer: { marginTop: 20, alignItems: 'center' },
});

export default SettingsScreen;