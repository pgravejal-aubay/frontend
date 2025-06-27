// frontend/screens/LoginScreen.js
import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, SafeAreaView, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Pressable, StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
// Assurez-vous que ces chemins sont corrects
import { authStyles as styles } from '../styles/authStyles';
import { login } from '../services/authService';
import { AuthContext } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const themedStyles = styles('light');
  const { signIn, textSize } = useContext(AuthContext); // Get signIn from context

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password); // Utilise l'email comme identifiant
      signIn();
    } catch (err) {
      setError(err.message || 'La connexion a échoué. Veuillez vérifier vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={themedStyles.screen}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={themedStyles.keyboardAvoidingContainer}
      >
        <View style={themedStyles.centeredContainer}>
          <Text style={[themedStyles.title,{ fontSize: 28 + textSize }]}>Connexion au compte</Text>
          
          <Pressable style={themedStyles.subtitleContainer} onPress={() => navigation.navigate('Register')}>
            <Text style={[themedStyles.subtitleText, { fontSize: 14 + textSize }]}>
              → Pas encore de compte ?{' '}
              <Text style={[themedStyles.subtitleLink,{ fontSize: 14 + textSize }]}>S'inscrire</Text>
            </Text>
          </Pressable>

          <View style={themedStyles.card}>
            {error ? <Text style={[themedStyles.errorText, { fontSize: 16 + textSize }]}>{error}</Text> : null}
            
            <Text style={themedStyles.label}>Adresse mail</Text>
            <TextInput
              style={themedStyles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="exemple@mail.com"
            />

            <Text style={themedStyles.label}>Mot de passe</Text>
            <View style={themedStyles.passwordContainer}>
              <TextInput
                style={themedStyles.passwordInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                placeholder="Votre mot de passe"
              />
              <Pressable onPress={() => setPasswordVisible(!isPasswordVisible)}>
                <Icon name={isPasswordVisible ? 'eye' : 'eye-off'} size={22} color="#888" />
              </Pressable>
            </View>
            
            <TouchableOpacity style={themedStyles.primaryButton} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={[themedStyles.primaryButtonText, { fontSize: 14 + textSize }]}>Connexion</Text>}
            </TouchableOpacity>

            <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={[themedStyles.secondaryLink, { fontSize: 14 + textSize }]}>Mot de passe oublié ?</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}