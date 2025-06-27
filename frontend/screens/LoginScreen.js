// frontend/screens/LoginScreen.js
import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, SafeAreaView, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Pressable, StatusBar, ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { authStyles as styles } from '../styles/authStyles';
import { login } from '../services/authService';
import { AuthContext } from '../contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, textSize } = useContext(AuthContext);
  const theme = useColorScheme() ?? 'light';

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      signIn();
    } catch (err) {
      setError(err.message || 'La connexion a échoué. Veuillez vérifier vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles(theme).screen}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles(theme).container}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <Text style={[styles(theme).title, { fontSize: 28 + textSize }]}>Connexion au compte</Text>
          
          <Pressable style={styles(theme).subtitleContainer} onPress={() => navigation.navigate('Register')}>
            <Text style={[styles(theme).subtitleText, { fontSize: 14 + textSize }]}>
              → Pas encore de compte ?{' '}
              <Text style={[styles(theme).subtitleLink, { fontSize: 14 + textSize }]}>S'inscrire</Text>
            </Text>
          </Pressable>

          {error ? <Text style={[styles(theme).errorText, { fontSize: 16 + textSize }]}>{error}</Text> : null}
          
          <Text style={[styles(theme).label, { fontSize: 14 + textSize }]}>Adresse mail</Text>
          <TextInput
            style={styles(theme).input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="exemple@mail.com"
          />

          <Text style={[styles(theme).label, { fontSize: 14 + textSize }]}>Mot de passe</Text>
          <View style={styles(theme).passwordContainer}>
            <TextInput
              style={styles(theme).passwordInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              placeholder="Votre mot de passe"
            />
            <Pressable onPress={() => setPasswordVisible(!isPasswordVisible)}>
              <Icon name={isPasswordVisible ? 'eye' : 'eye-off'} size={22} color="#888" />
            </Pressable>
          </View>
          
          <TouchableOpacity style={styles(theme).primaryButton} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={[styles(theme).primaryButtonText, { fontSize: 16 + textSize }]}>Connexion</Text>}
          </TouchableOpacity>

          <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={[styles(theme).secondaryLink, { fontSize: 14 + textSize }]}>Mot de passe oublié ?</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}