// frontend/screens/RegisterScreen.js
import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Alert, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { register } from '../services/authService';
import { AuthContext } from '../contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { authStyles } from '../styles/authStyles';

export default function RegisterScreen({ navigation }) {
  // ... les états (useState) ne changent pas ...
  const { textSize } = useContext(AuthContext);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useColorScheme() ?? 'light';

  // ... les fonctions (handleRegister, openLink) ne changent pas ...
  const handleRegister = async () => { /* ... */ };
  const openLink = () => { /* ... */ };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={authStyles(theme).container}>
          <Text style={[authStyles(theme).title, { fontSize: 28 + textSize}]}>Création de compte</Text>
          
          {error ? <Text style={[authStyles(theme).errorText, { fontSize: 16 + textSize}]}>{error}</Text> : null}

          <View style={authStyles(theme).inputContainer}><Text style={[authStyles(theme).inputLabel, { fontSize: 14 + textSize}]}>Nom</Text><TextInput style={authStyles(theme).input} value={nom} onChangeText={setNom} /></View>
          <View style={authStyles(theme).inputContainer}><Text style={[authStyles(theme).inputLabel, { fontSize: 14 + textSize}]}>Prénom</Text><TextInput style={authStyles(theme).input} value={prenom} onChangeText={setPrenom} /></View>
          <View style={authStyles(theme).inputContainer}><Text style={[authStyles(theme).inputLabel, { fontSize: 14 + textSize}]}>Adresse mail</Text><TextInput style={authStyles(theme).input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /></View>
          <View style={authStyles(theme).inputContainer}><Text style={[authStyles(theme).inputLabel, { fontSize: 14 + textSize}]}>Mot de passe</Text><View style={authStyles(theme).passwordWrapper}><TextInput style={authStyles(theme).inputInWrapper} value={password} onChangeText={setPassword} secureTextEntry={!isPasswordVisible} /><TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={authStyles(theme).eyeIcon}><Ionicons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={24} color="#888" /></TouchableOpacity></View></View>
          <View style={authStyles(theme).inputContainer}><Text style={[authStyles(theme).inputLabel, { fontSize: 14 + textSize}]}>Confirmer le mot de passe</Text><View style={authStyles(theme).passwordWrapper}><TextInput style={authStyles(theme).inputInWrapper} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!isConfirmPasswordVisible} /><TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} style={authStyles(theme).eyeIcon}><Ionicons name={isConfirmPasswordVisible ? "eye-off-outline" : "eye-outline"} size={24} color="#888" /></TouchableOpacity></View></View>
          
          {/* --- MODIFICATION STRUCTURELLE ICI --- */}
          <View style={authStyles(theme).legalSectionContainer}>
            {/* Première ligne */}
            <View style={authStyles(theme).legalRow}>
              <Text style={[authStyles(theme).legalText, { fontSize: 12 + textSize}]}>En poursuivant vous acceptez nos </Text>
              <TouchableOpacity onPress={openLink}>
                <Text style={[authStyles(theme).legalLink, { fontSize: 12 + textSize}]}>Conditions d'utilisation</Text>
              </TouchableOpacity>
            </View>

            {/* Deuxième ligne */}
            <View style={authStyles(theme).legalRow}>
              <Text style={[authStyles(theme).legalText, { fontSize: 12 + textSize}]}>et notre </Text>
              <TouchableOpacity onPress={openLink}>
                <Text style={[authStyles(theme).legalLink, { fontSize: 12 + textSize}]}>Politique de confidentialité</Text>
              </TouchableOpacity>
              <Text style={[authStyles(theme).legalText, { fontSize: 12 + textSize}]}>.</Text>
            </View>
          </View>

          {/* ... Le reste ne change pas ... */}
          <TouchableOpacity style={authStyles(theme).registerButton} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={[authStyles(theme).registerButtonText, { fontSize: 16 + textSize}]}>Inscription</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[authStyles(theme).linkButtonText, { fontSize: 14 + textSize }]}>Déjà un compte ? Connectez-vous</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}