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

  // ... les fonctions (handleRegister, openLink) ne changent pas ...
  const handleRegister = async () => { /* ... */ };
  const openLink = () => { /* ... */ };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={authStyles.container}>
          <Text style={[authStyles.title, { fontSize: 28 + textSize}]}>Création de compte</Text>
          
          {error ? <Text style={[authStyles.errorText, { fontSize: 16 + textSize}]}>{error}</Text> : null}

          <View style={authStyles.inputContainer}><Text style={[authStyles.inputLabel, { fontSize: 14 + textSize}]}>Nom</Text><TextInput style={authStyles.input} value={nom} onChangeText={setNom} /></View>
          <View style={authStyles.inputContainer}><Text style={[authStyles.inputLabel, { fontSize: 14 + textSize}]}>Prénom</Text><TextInput style={authStyles.input} value={prenom} onChangeText={setPrenom} /></View>
          <View style={authStyles.inputContainer}><Text style={[authStyles.inputLabel, { fontSize: 14 + textSize}]}>Adresse mail</Text><TextInput style={authStyles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /></View>
          <View style={authStyles.inputContainer}><Text style={[authStyles.inputLabel, { fontSize: 14 + textSize}]}>Mot de passe</Text><View style={authStyles.passwordWrapper}><TextInput style={authStyles.inputInWrapper} value={password} onChangeText={setPassword} secureTextEntry={!isPasswordVisible} /><TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={authStyles.eyeIcon}><Ionicons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={24} color="#888" /></TouchableOpacity></View></View>
          <View style={authStyles.inputContainer}><Text style={[authStyles.inputLabel, { fontSize: 14 + textSize}]}>Confirmer le mot de passe</Text><View style={authStyles.passwordWrapper}><TextInput style={authStyles.inputInWrapper} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!isConfirmPasswordVisible} /><TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} style={authStyles.eyeIcon}><Ionicons name={isConfirmPasswordVisible ? "eye-off-outline" : "eye-outline"} size={24} color="#888" /></TouchableOpacity></View></View>
          
          {/* --- MODIFICATION STRUCTURELLE ICI --- */}
          <View style={authStyles.legalSectionContainer}>
            {/* Première ligne */}
            <View style={authStyles.legalRow}>
              <Text style={[authStyles.legalText, { fontSize: 12 + textSize}]}>En poursuivant vous acceptez nos </Text>
              <TouchableOpacity onPress={openLink}>
                <Text style={[authStyles.legalLink, { fontSize: 12 + textSize}]}>Conditions d'utilisation</Text>
              </TouchableOpacity>
            </View>

            {/* Deuxième ligne */}
            <View style={authStyles.legalRow}>
              <Text style={[authStyles.legalText, { fontSize: 12 + textSize}]}>et notre </Text>
              <TouchableOpacity onPress={openLink}>
                <Text style={[authStyles.legalLink, { fontSize: 12 + textSize}]}>Politique de confidentialité</Text>
              </TouchableOpacity>
              <Text style={[authStyles.legalText, { fontSize: 12 + textSize}]}>.</Text>
            </View>
          </View>

          {/* ... Le reste ne change pas ... */}
          <TouchableOpacity style={authStyles.registerButton} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={[authStyles.registerButtonText, { fontSize: 16 + textSize}]}>Inscription</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[authStyles.linkButtonText, { fontSize: 14 + textSize }]}>Déjà un compte ? Connectez-vous</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}