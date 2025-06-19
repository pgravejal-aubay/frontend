// frontend/App.js
import React, { useEffect, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, Text } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
// import TranslationScreen from './screens/TranslationScreen'; // Ajouté pour compatibilité
import { getToken, logout } from './services/authService';
import { AuthContext } from './contexts/AuthContext';

// Placeholder screens
const HistoryScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }} >
    <Text>Page Historique</Text>
  </View>
);

const Stack = createStackNavigator();

export default function App() {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
            isLoading: false,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
            isLoading: false,
          };
        default:
          return prevState;
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    }
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken;
      try {
        userToken = await getToken();
      } catch (e) {
        console.error('Failed to restore token', e);
      }
      dispatch({ type: 'RESTORE_TOKEN', token: userToken });
    };
    bootstrapAsync();
  }, []);

  const authContext = useMemo(
    () => ({
      signIn: async () => {
        const token = await getToken();
        dispatch({ type: 'SIGN_IN', token });
      },
      signOut: async () => {
        await logout();
        dispatch({ type: 'SIGN_OUT' });
      },
      signUp: async () => {
        // Placeholder
      },
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
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          ) : (
            <>
              {/* <Stack.Screen name="Translation" component={TranslationScreen} /> */}
              <Stack.Screen name="Video" component={HomeScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="History" component={HistoryScreen} />
              <Stack.Screen name="Home" component={HomeScreen} />
              {/* Note: "ProcessingScreen" est mentionné mais non défini, j'ai laissé comme commentaire */}
              {/* <Stack.Screen name="Processing" component={ProcessingScreen} /> */}
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}