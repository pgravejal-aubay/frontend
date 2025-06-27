// screens/CoverScreen.js

import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { styles } from '../styles/coverStyles';

export default function CoverScreen() {
  const navigation = useNavigation();
  const { textSize } = useContext(AuthContext);
  const theme = useColorScheme() ?? 'light';

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  const handleContinueWithoutAccount = () => {
    navigation.navigate('HomeScreen');
  };

  return (
    <SafeAreaView style={styles(theme).container}>
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