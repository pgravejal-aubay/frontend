

// frontend/App.js

import React, { useEffect, useMemo, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, Text, Image } from 'react-native'; // Importe Image
import * as SplashScreen from 'expo-splash-screen';

// --- Import des services et contextes ---
import { getToken, logout } from './services/authService';
import { AuthContext } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { checkAiStatus } from './services/api'; // Chemin corrigé pour './service/api'
import AppStyles from './styles/AppStyles';

// Garde le splash screen visible jusqu'à ce que nous soyons prêts à cacher
SplashScreen.preventAutoHideAsync();

// --- Import de tous les écrans ---
import CoverScreen from './screens/CoverScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ProcessingScreen from './screens/ProcessingScreen';
import TranslationScreen from './screens/TranslationScreen';
import SettingsScreen from './screens/SettingsScreen';
import HistoryScreen from './screens/HistoryScreen';
import PolicyScreen from './screens/PolicyScreen';
import AboutTeamScreen from './screens/AboutTeamScreen';
import VideoPreviewScreen from './screens/PrevisualisationScreen';


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
        case 'SET_TEXT_SIZE_OFFSET':
          return { ...prevState, textSize : action.offset };
        default:
          return prevState;
      }
    },
    { isLoading: true, isSignout: false, userToken: null, textSize : 0 }
  );

  // Effet pour restaurer le token et gérer l'initialisation de l'application
  useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken;
      try {
        // --- Attendre que le backend réponde ---
        console.log('Attente de la disponibilité du backend...');
        let backendReady = false;
        while (!backendReady) {
          backendReady = await checkAiStatus(); // Appel de la fonction importée
          if (!backendReady) {
            console.log('Backend non disponible, nouvelle tentative dans 1 seconde...');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde avant de réessayer
          }
        }
        console.log('Backend disponible !');
        // --- Fin de l'attente du backend ---

        userToken = await getToken(); // Restaure le token utilisateur
      } catch (e) {
        console.error("Échec de la restauration du token ou de la connexion au backend", e);
      } finally {
        // Dispatche l'action pour indiquer que le chargement initial est terminé
        dispatch({ type: 'RESTORE_TOKEN', token: userToken });
      }
    };
    bootstrapAsync();
  }, []);

  // NOUVEL EFFET : Masque le splash screen natif dès que le composant App est monté
  // et que la vue de chargement personnalisée est prête à être rendue.
  // Cela garantit que notre écran de chargement React Native devient visible.
  useEffect(() => {
    async function hideNativeSplash() {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('Erreur lors du masquage du splash screen natif:', e);
      }
    }
    hideNativeSplash();
  }, []); // S'exécute une seule fois après le premier rendu du composant

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
      signUp: async (data) => { /* Placeholder pour l'inscription */ },
      setTextSize: (offset) => dispatch({ type: 'SET_TEXT_SIZE_OFFSET', offset }),
      textSize: state.textSize, // Expose l'offset de taille
    }),
    [state.textSize]
  );

  // Si l'application est toujours en chargement (attente du backend/token),
  // affiche l'indicateur et le message personnalisé.
  if (state.isLoading) {
    return (
      <View style={AppStyles.loadingContainer}>
        {/* Ajout du logo de l'application */}
        <Image
          source={require('./assets/images/logo.png')} // Assurez-vous que le chemin vers votre logo est correct
          style={AppStyles.logo}
        />
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={AppStyles.loadingText}>Veuillez patienter...</Text>
        <Text style={AppStyles.loadingSubText}>Connexion au serveur et chargement de l'application</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authContext}>
      <SettingsProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
              {state.userToken == null ? (
              // Écrans si l'utilisateur N'EST PAS connecté
              <>
                <Stack.Screen name="Cover" component={CoverScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Processing" component={ProcessingScreen} />
                <Stack.Screen name="Translation" component={TranslationScreen} />
                <Stack.Screen name="AboutTeam" component={AboutTeamScreen} />
                <Stack.Screen name="VideoPreview" component={VideoPreviewScreen} />
              </>
            ) : (
              // Écrans si l'utilisateur EST connecté
              <>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="History" component={HistoryScreen} />
                <Stack.Screen name="Processing" component={ProcessingScreen} />
                <Stack.Screen name="Translation" component={TranslationScreen} />
                <Stack.Screen name="Policy" component={PolicyScreen} />
                <Stack.Screen name="AboutTeam" component={AboutTeamScreen} />
                <Stack.Screen name="VideoPreview" component={VideoPreviewScreen} options={{ headerShown: false }} 
  />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SettingsProvider>
    </AuthContext.Provider>
  );
}
