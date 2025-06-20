// // frontend/screens/RegisterScreen.js
// import React, { useState } from 'react';
// import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
// import { register } from '../services/authService';
// import { authStyles } from '../styles/authStyles';

// export default function RegisterScreen({ navigation }) {
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleRegister = async () => {
//     if (!username || !email || !password) {
//       setError('Please fill all fields.');
//       return;
//     }
//     setLoading(true);
//     setError('');
//     try {
//       const data = await register(username, email, password);
//       Alert.alert('Success', data.message, [{ text: "OK", onPress: () => navigation.navigate('Login') }]);
//     } catch (err) {
//       setError(err.message || 'Could not register.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={authStyles.container}> 
//       <Text style={authStyles.title}>Register</Text> 
//       {error ? <Text style={authStyles.errorText}>{error}</Text> : null}
//       <TextInput
//         style={authStyles.input} 
//         placeholder="Username"
//         value={username}
//         onChangeText={setUsername}
//         autoCapitalize="none"
//       />
//       <TextInput
//         style={authStyles.input} 
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//         keyboardType="email-address"
//         autoCapitalize="none"
//       />
//       <TextInput
//         style={authStyles.input} 
//         placeholder="Password"
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//       />
//       <View style={authStyles.buttonContainer}>
//         <Button title={loading ? "Registering..." : "Register"} onPress={handleRegister} disabled={loading} />
//       </View>
//       <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//         <Text style={authStyles.linkButtonText}>Already have an account? Login</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// frontend/screens/RegisterScreen.js
import React, { useState } from 'react';
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
import { register } from '../services/authService';
import { authStyles } from '../styles/authStyles';

export default function RegisterScreen({ navigation }) {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!nom || !prenom || !email || !password || !confirmPassword) {
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
      const data = await register(nom, prenom, email, password);
      Alert.alert('Succès', 'Votre compte a été créé.', [{ text: "OK", onPress: () => navigation.navigate('Login') }]);
    } catch (err) {
      setError(err.message || "L'inscription a échoué.");
    } finally {
      setLoading(false);
    }
  };
  
  const openLink = () => Alert.alert("Lien cliqué", "Cette action ouvrirait le lien dans un navigateur.");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView>
        <View style={authStyles.container}>
          <Text style={authStyles.title}>Création de compte</Text>
          
          {error ? <Text style={authStyles.errorText}>{error}</Text> : null}

          <View style={authStyles.inputContainer}>
            <Text style={authStyles.inputLabel}>Nom</Text>
            <TextInput style={authStyles.input} value={nom} onChangeText={setNom} />
          </View>

          <View style={authStyles.inputContainer}>
            <Text style={authStyles.inputLabel}>Prénom</Text>
            <TextInput style={authStyles.input} value={prenom} onChangeText={setPrenom} />
          </View>

          <View style={authStyles.inputContainer}>
            <Text style={authStyles.inputLabel}>Adresse mail</Text>
            <TextInput style={authStyles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={authStyles.inputContainer}>
            <Text style={authStyles.inputLabel}>Mot de passe</Text>
            <TextInput style={authStyles.input} value={password} onChangeText={setPassword} secureTextEntry />
          </View>
          
          <View style={authStyles.inputContainer}>
            <Text style={authStyles.inputLabel}>Confirmer le mot de passe</Text>
            <TextInput style={authStyles.input} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
          </View>

          <Text style={authStyles.legalText}>
            En poursuivant vous acceptez nos{' '}
            <Text style={authStyles.legalLink} onPress={openLink}>Conditions d'utilisation</Text>
            {' '}et notre{' '}
            <Text style={authStyles.legalLink} onPress={openLink}>Politique de confidentialité</Text>
            .
          </Text>
          
          <TouchableOpacity 
            style={[authStyles.input, {height: 50, backgroundColor: '#1c1e21', justifyContent: 'center', alignItems: 'center'}]} 
            onPress={handleRegister} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Inscription</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={authStyles.linkButtonText}>Déjà un compte ? Connectez-vous</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}