// screens/CoverScreen.js

import React, {useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { styles } from '../styles/coverStyles'; // Assure-toi que le chemin est correct

export default function CoverScreen() {
  const navigation = useNavigation();
  const { textSize } = useContext(AuthContext);
  const theme = useColorScheme() ?? 'dark';

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  const handleContinueWithoutAccount = () => {
    // On remplace l'alerte par la navigation directe vers la page Vidéo
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles(theme).container}>
        {/* Ajout du logo au centre de l'écran */}
        <Image
        source={require('../assets/images/logo.png')} // Chemin vers ton logo. Assure-toi qu'il est correct.
        style={styles(theme).logo}
      />

      <View style={styles(theme).buttonContainer}>
        <TouchableOpacity style={styles(theme).loginButton} onPress={handleLoginPress}>
          <Text style={[styles(theme).loginButtonText, { fontSize: 16 + textSize }]}>Se connecter</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleContinueWithoutAccount}>
          <View style={styles(theme).linkContainer}>
            <Text style={[styles(theme).arrowText, { fontSize: 22 + textSize }]}>→</Text>
            <Text style={[styles(theme).linkText, { fontSize: 14 + textSize }]}>Continuer sans créer de compte</Text>
          </View>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}
