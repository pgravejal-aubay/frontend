// frontend/screens/SettingsScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Picker } from '@react-native-picker/picker';
import { Separator } from '@/components/ui/separator';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { styles } from '../styles/SettingsStyle';

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
  const navigation = useNavigation();
  const { signOut } = useContext(AuthContext);

  const handleLogout = async () => {
    await signOut();
    // La navigation vers Login sera gérée par App.js
  };

  // État pour chaque Picker
  const [selectedValues, setSelectedValues] = useState({
    3: 'fr', // Langue cible
    5: 'homme', // Voix
    6: 'x1', // Vitesse de lecture
  });

  // État pour le menu utilisateur
  const [isUserMenuVisible, setUserMenuVisible] = useState(false);

  // Fonctions pour le menu utilisateur
  const handleGoHome = () => navigation.navigate('Home');
  const handleGoToHistory = () => navigation.navigate('History');
  const handleGoToSettings = () => console.log('Already on Settings'); // Déjà sur Settings
  const handleClose = () => navigation.navigate('Home'); // Retour à Home comme dans TranslationScreen
  const handleLogoutFromMenu = () => {
    setUserMenuVisible(false);
    Alert.alert('Déconnexion', 'Vous avez été déconnecté.');
    navigation.navigate('Login');
  };
  const handleDeleteAccount = () => {
    setUserMenuVisible(false);
    Alert.alert(
      'Supprimer le compte',
      'Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            console.log('Compte supprimé');
            navigation.navigate('Login');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header fixe */}
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

      {/* Contenu défilant */}
      <ScrollView>
        {/* Menu utilisateur (modal) */}
        <Modal
          transparent={true}
          visible={isUserMenuVisible}
          onRequestClose={() => setUserMenuVisible(false)}
          animationType="fade"
        >
          <TouchableOpacity style={{ flex: 1 }} onPressOut={() => setUserMenuVisible(false)}>
            <View style={styles.userMenu}>
              <TouchableOpacity style={styles.menuItem} onPress={handleLogoutFromMenu}>
                <Text style={styles.menuItemText}>Déconnexion</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
                <Text style={[styles.menuItemText, { color: 'red' }]}>Supprimer le compte</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

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
                    <Ionicons name="remove" size={16} color="black" style={styles.icon} />
                  </Button>
                  <Separator style={styles.separator} />
                  <Button variant="ghost" size="icon" style={styles.sizeButton}>
                    <Ionicons name="add" size={16} color="black" style={styles.icon} />
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
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;