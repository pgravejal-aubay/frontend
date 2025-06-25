// frontend/screens/RegisterScreen.js
import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Pressable, StatusBar, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

// On utilise toujours le même fichier de style, c'est parfait
import { authStyles as styles } from '../styles/authStyles';
import { register } from '../services/authService';

export default function RegisterScreen({ navigation }) {
  // CHANGEMENT 1: Remplacer l'état 'username' par 'prenom' et 'nom'
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    // CHANGEMENT 2: Mettre à jour la validation
    if (!prenom || !nom || !email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // CHANGEMENT 3: Envoyer les nouvelles données au service
      await register(prenom, nom, email, password);
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
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollableContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Création de compte</Text>
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* CHANGEMENT 4: Remplacer le champ 'Nom d'utilisateur' par 'Prénom' et 'Nom' */}
            <Text style={styles.label}>Prénom</Text>
            <TextInput
              style={styles.input}
              value={prenom}
              onChangeText={setPrenom}
              autoCapitalize="words" // Met une majuscule au début
            />

            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={styles.input}
              value={nom}
              onChangeText={setNom}
              autoCapitalize="words" // Met une majuscule au début
            />
            
            <Text style={styles.label}>Adresse mail</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput style={styles.passwordInput} value={password} onChangeText={setPassword} secureTextEntry={!isPasswordVisible} />
              <Pressable onPress={() => setPasswordVisible(!isPasswordVisible)}><Icon name={isPasswordVisible ? 'eye' : 'eye-off'} size={22} color="#888" /></Pressable>
            </View>

            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput style={styles.passwordInput} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!isConfirmPasswordVisible} />
              <Pressable onPress={() => setConfirmPasswordVisible(!isConfirmPasswordVisible)}><Icon name={isConfirmPasswordVisible ? 'eye' : 'eye-off'} size={22} color="#888" /></Pressable>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>S'inscrire</Text>}
            </TouchableOpacity>

            <Pressable style={{ marginTop: 20, alignItems: 'center' }} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.subtitleText}>Déjà un compte ? <Text style={styles.subtitleLink}>Se connecter</Text></Text>
            </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}