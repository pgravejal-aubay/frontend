// screens/CoverScreen.js

import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import { styles } from '../styles/coverStyles'; 

export default function CoverScreen() {
  const navigation = useNavigation();
  const { textSize } = useContext(AuthContext);

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  const handleContinueWithoutAccount = () => {
    // On remplace l'alerte par la navigation directe vers la page Vidéo
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
          <Text style={[styles.loginButtonText, { fontSize: 16 + textSize }]}>Se connecter</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleContinueWithoutAccount}>
          <View style={styles.linkContainer}>
            <Text style={[styles.arrowText, { fontSize: 22 + textSize }]}>→</Text>
            <Text style={[styles.linkText, { fontSize: 14 + textSize }]}>Continuer sans créer de compte</Text>
          </View>
        </TouchableOpacity>
        
      </View>
    </SafeAreaView>
  );
}