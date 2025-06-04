// frontend/screens/LoginScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { login } from '../services/authService';
import { AuthContext } from '../App'; 
import { authStyles } from '../styles/authStyles';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useContext(AuthContext); // Get signIn from context

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      signIn(); // Update auth state in App.js
      // Navigation to HomeScreen is handled by App.js based on token presence
    } catch (err) {
      setError(err.message || 'Could not log in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={authStyles.container}> 
      <Text style={authStyles.title}>Login</Text> 
      {error ? <Text style={authStyles.errorText}>{error}</Text> : null}
      <TextInput
        style={authStyles.input} 
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={authStyles.input} 
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={authStyles.buttonContainer}>
        <Button title={loading ? "Logging in..." : "Login"} onPress={handleLogin} disabled={loading} />
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={authStyles.linkButtonText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}