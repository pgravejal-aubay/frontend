// screens/CoverScreen.js

import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView,
  Alert // On le garde au cas où, mais on ne l'utilise plus pour ce bouton
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { styles } from '../styles/coverStyles'; 

export default function CoverScreen() {
  const navigation = useNavigation();

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  // --- MODIFICATION ICI ---
  const handleContinueWithoutAccount = () => {
    // On remplace l'alerte par la navigation directe vers la page Vidéo
    navigation.navigate('HomeScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
          <Text style={styles.loginButtonText}>Se connecter</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleContinueWithoutAccount}>
          <View style={styles.linkContainer}>
            <Text style={styles.arrowText}>→</Text>
            <Text style={styles.linkText}>Continuer sans créer de compte</Text>
          </View>
        </TouchableOpacity>
        
      </View>
    </SafeAreaView>
  );
}