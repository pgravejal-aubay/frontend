// screens/CoverScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { coverStyles } from '../styles/coverStyles';

export default function CoverScreen() {
  const navigation = useNavigation();
  const themedStyles = coverStyles('light'); // Forcer le thème clair

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  const handleContinueWithoutAccount = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={themedStyles.container}>
      <View style={themedStyles.buttonContainer}>
        <TouchableOpacity style={themedStyles.loginButton} onPress={handleLoginPress}>
          <Text style={themedStyles.loginButtonText}>Se connecter</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleContinueWithoutAccount}>
          <View style={themedStyles.linkContainer}>
            <Text style={themedStyles.arrowText}>→</Text>
            <Text style={themedStyles.linkText}>Continuer sans créer de compte</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
