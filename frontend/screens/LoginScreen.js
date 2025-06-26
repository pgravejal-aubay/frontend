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
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.centeredContainer}>
          <Text style={[styles.title,{ fontSize: 28 + textSize }]}>Connexion au compte</Text>
          
          <Pressable style={styles.subtitleContainer} onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.subtitleText, { fontSize: 14 + textSize }]}>
              → Pas encore de compte ?{' '}
              <Text style={[styles.subtitleLink,{ fontSize: 14 + textSize }]}>S'inscrire</Text>
            </Text>
          </Pressable>

          <View style={styles.card}>
            {error ? <Text style={[styles.errorText, { fontSize: 16 + textSize }]}>{error}</Text> : null}
            
            <Text style={styles.label}>Adresse mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="exemple@mail.com"
            />

            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                placeholder="Votre mot de passe"
              />
              <Pressable onPress={() => setPasswordVisible(!isPasswordVisible)}>
                <Icon name={isPasswordVisible ? 'eye' : 'eye-off'} size={22} color="#888" />
              </Pressable>
            </View>
            
            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={[styles.primaryButtonText, { fontSize: 14 + textSize }]}>Connexion</Text>}
            </TouchableOpacity>

            <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={[styles.secondaryLink, { fontSize: 14 + textSize }]}>Mot de passe oublié ?</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}