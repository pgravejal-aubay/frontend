// frontend/App.js

import React, { useEffect, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, Text } from 'react-native';

// --- Import de tous les écrans (sans doublons) ---
import CoverScreen from './screens/CoverScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen'; 
import ProcessingScreen from './screens/ProcessingScreen'; 
import TranslationScreen from './screens/TranslationScreen'; 
import SettingsScreen from './screens/SettingsScreen';
import HistoryScreen from './screens/HistoryScreen';
import { getToken, logout } from './services/authService';
import { AuthContext } from './contexts/AuthContext';

// --- Ecrans temporaires (placeholders) ---
//const HistoryScreen = () => <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><Text>Page Historique</Text></View>;

const Stack = createStackNavigator();

export default function App() {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return { ...prevState, userToken: action.token, isLoading: false };
        case 'SIGN_IN':
          return { ...prevState, isSignout: false, userToken: action.token, isLoading: false };
        case 'SIGN_OUT':
          return { ...prevState, isSignout: true, userToken: null, isLoading: false };
        default:
          return prevState;
      }
    },
    { isLoading: true, isSignout: false, userToken: null }
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken;
      try {
        userToken = await getToken();
      } catch (e) {
        console.error("Failed to restore token", e);
      }
      dispatch({ type: 'RESTORE_TOKEN', token: userToken });
    };
    bootstrapAsync();
  }, []);

  const authContext = useMemo(
    () => ({
      signIn: async () => {
        const token = await getToken();
        dispatch({ type: 'SIGN_IN', token: token });
      },
      signOut: async () => {
        await logout();
        dispatch({ type: 'SIGN_OUT' });
      },
      signUp: async (data) => { /* Placeholder */ },
    }),
    []
  );

  if (state.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {state.userToken == null ? (
            // Ecrans si l'utilisateur N'EST PAS connecté
            <>
              <Stack.Screen name="Cover" component={CoverScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Processing" component={ProcessingScreen} />
              <Stack.Screen name="Translation" component={TranslationScreen} />
              
              {/* --- MODIFICATION ICI --- */}
              {/* On rend la page Vidéo accessible même si on n'est pas connecté */}
              <Stack.Screen name="Home" component={HomeScreen} />
            </>
          ) : (
            // Ecrans si l'utilisateur EST connecté
            <>
              {/* Le flux normal commencera sur la page Vidéo */}
              <Stack.Screen name="Home" component={HomeScreen} />
              
              {/* Toutes les autres pages de l'application sont déclarées ici */}

              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="History" component={HistoryScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
