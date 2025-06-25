// frontend/screens/LoginScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native'; // Removed StyleSheet
import { login } from '../services/authService';
import { AuthContext } from '../contexts/AuthContext'; // Add this line
import { useColorScheme } from '@/hooks/useColorScheme';
import { authStyles } from '../styles/authStyles';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, textSize } = useContext(AuthContext); // Get signIn from context
  const theme = useColorScheme() ?? 'light';

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(username, password); // authService.login performs API call & stores token
      signIn(); // context.signIn reads the stored token & updates global App state
    } catch (err) {
      setError(err.message || 'Could not log in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={authStyles(theme).container}>
      <Text style={[authStyles(theme).title, { fontSize: 28 + textSize }]}>Login</Text>
      {error ? <Text style={[authStyles(theme).errorText, { fontSize: 16 + textSize }]}>{error}</Text> : null}
      <TextInput
        style={authStyles(theme).input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={authStyles(theme).input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={authStyles(theme).buttonContainer}>
        <Button title={loading ? "Logging in..." : "Login"} onPress={handleLogin} disabled={loading} />
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={[authStyles(theme).linkButtonText, { fontSize: 14 + textSize }]}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}