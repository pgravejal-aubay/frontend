// frontend/screens/RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { register } from '../services/authService';
import { authStyles } from '../styles/authStyles';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setError('Please fill all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await register(username, email, password);
      Alert.alert('Success', data.message, [{ text: "OK", onPress: () => navigation.navigate('Login') }]);
    } catch (err) {
      setError(err.message || 'Could not register.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={authStyles.container}> 
      <Text style={authStyles.title}>Register</Text> 
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
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
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
        <Button title={loading ? "Registering..." : "Register"} onPress={handleRegister} disabled={loading} />
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={authStyles.linkButtonText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}