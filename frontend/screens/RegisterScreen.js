// frontend/screens/RegisterScreen.js
import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Pressable, StatusBar, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { authStyles as styles } from '../styles/authStyles';
import { register } from '../services/authService';
import { AuthContext } from '../contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import AppHeader from '../components/AppHeaders';

export default function RegisterScreen({ navigation }) {
  const { textSize } = useContext(AuthContext);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useColorScheme() ?? 'light';

  const openLink = () => { /* Logique pour ouvrir un lien */ };
  const handleRegister = async () => {
    if (!prenom || !nom || !email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(prenom, nom, email, password, confirmPassword);
      Alert.alert(
        "Inscription réussie !",
        "Vous pouvez maintenant vous connecter avec votre email et mot de passe.",
        [{ text: "OK", onPress: () => navigation.navigate('Login') }]
      );
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles(theme).screen}>
      <StatusBar barStyle="dark-content" />
      <AppHeader />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles(theme).container}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <Text style={[styles(theme).title, { fontSize: 28 + textSize }]}>Création de compte</Text>
          
          {error ? <Text style={[styles(theme).errorText, { fontSize: 16 + textSize }]}>{error}</Text> : null}

          <Text style={[styles(theme).label, { fontSize: 14 + textSize }]}>Prénom</Text>
          <TextInput
            style={styles(theme).input}
            value={prenom}
            onChangeText={setPrenom}
            autoCapitalize="words"
          />

          <Text style={[styles(theme).label, { fontSize: 14 + textSize }]}>Nom</Text>
          <TextInput
            style={styles(theme).input}
            value={nom}
            onChangeText={setNom}
            autoCapitalize="words"
          />
          
          <Text style={[styles(theme).label, { fontSize: 14 + textSize }]}>Adresse mail</Text>
          <TextInput
            style={styles(theme).input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles(theme).label, { fontSize: 14 + textSize }]}>Mot de passe</Text>
          <View style={styles(theme).passwordContainer}>
            <TextInput
              style={styles(theme).passwordInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
            />
            <Pressable onPress={() => setPasswordVisible(!isPasswordVisible)}>
              <Icon name={isPasswordVisible ? 'eye' : 'eye-off'} size={22} color="#888" />
            </Pressable>
          </View>

          <Text style={[styles(theme).label, { fontSize: 14 + textSize }]}>Confirmer le mot de passe</Text>
          <View style={styles(theme).passwordContainer}>
            <TextInput
              style={styles(theme).passwordInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!isConfirmPasswordVisible}
            />
            <Pressable onPress={() => setConfirmPasswordVisible(!isConfirmPasswordVisible)}>
              <Icon name={isConfirmPasswordVisible ? 'eye' : 'eye-off'} size={22} color="#888" />
            </Pressable>
          </View>

          <View style={styles(theme).legalSectionContainer}>
            <View style={styles(theme).legalRow}>
              <Text style={[styles(theme).legalText, { fontSize: 12 + textSize }]}>En vous inscrivant, vous acceptez nos </Text>
              <TouchableOpacity onPress={openLink}>
                <Text style={[styles(theme).legalLink, { fontSize: 12 + textSize }]}>Conditions d'utilisation</Text>
              </TouchableOpacity>
              <Text style={[styles(theme).legalText, { fontSize: 12 + textSize }]}> et notre </Text>
              <TouchableOpacity onPress={openLink}>
                <Text style={[styles(theme).legalLink, { fontSize: 12 + textSize }]}>Politique de confidentialité</Text>
              </TouchableOpacity>
              <Text style={[styles(theme).legalText, { fontSize: 12 + textSize }]}>.</Text>
            </View>
          </View>

          <TouchableOpacity style={styles(theme).primaryButton} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={[styles(theme).primaryButtonText, { fontSize: 16 + textSize }]}>S'inscrire</Text>}
          </TouchableOpacity>

          <Pressable style={{ marginTop: 20, alignItems: 'center' }} onPress={() => navigation.navigate('Login')}>
            <Text style={[styles(theme).subtitleText, { fontSize: 14 + textSize }]}>Déjà un compte ? <Text style={[styles(theme).subtitleLink, { fontSize: 14 + textSize }]}>Se connecter</Text></Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}