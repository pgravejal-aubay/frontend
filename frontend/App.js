// // frontend/App.js
// import React, { useEffect, useMemo } from 'react'; // Removed useState as dispatch handles state
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { View, ActivityIndicator } from 'react-native'; 

// import LoginScreen from './screens/LoginScreen';
// import RegisterScreen from './screens/RegisterScreen';
// import HomeScreen from './screens/HomeScreen';
// import { getToken, logout } from './services/authService';
// import { AuthContext } from './contexts/AuthContext';

// const Stack = createStackNavigator();

// export default function App() {
//   const [state, dispatch] = React.useReducer(
//     (prevState, action) => {
//       switch (action.type) {
//         case 'RESTORE_TOKEN':
//           return {
//             ...prevState,
//             userToken: action.token,
//             isLoading: false,
//           };
//         case 'SIGN_IN':
//           return {
//             ...prevState,
//             isSignout: false,
//             userToken: action.token,
//             isLoading: false, // Ensure loading is false
//           };
//         case 'SIGN_OUT':
//           return {
//             ...prevState,
//             isSignout: true,
//             userToken: null,
//             isLoading: false, // Ensure loading is false
//           };
//         default:
//           return prevState;
//       }
//     },
//     {
//       isLoading: true,
//       isSignout: false,
//       userToken: null,
//     }
//   );

//   useEffect(() => {
//     const bootstrapAsync = async () => {
//       let userToken;
//       try {
//         userToken = await getToken();
//       } catch (e) {
//         console.error("Failed to restore token", e);
//         // Restoring token failed
//       }
//       dispatch({ type: 'RESTORE_TOKEN', token: userToken });
//     };
//     bootstrapAsync();
//   }, []);

//   const authContext = useMemo(
//     () => ({
//       signIn: async () => { // Called by LoginScreen after authService.login stores the token
//         const token = await getToken(); // Read the token that was just stored
//         dispatch({ type: 'SIGN_IN', token: token });
//       },
//       signOut: async () => {
//         await logout();
//         dispatch({ type: 'SIGN_OUT' });
//       },
//       signUp: async (data) => {
//         // This is a placeholder. If sign-up should auto-login,
//         // it would call the register service, then potentially signIn.
//       },
//     }),
//     []
//   );

//   // Removed the potentially problematic useEffect that re-called signIn on token change.
//   // RESTORE_TOKEN and the signIn action in LoginScreen handle token state updates sufficiently.

//   if (state.isLoading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return (
//     <AuthContext.Provider value={authContext}>
//       <NavigationContainer>
//         <Stack.Navigator screenOptions={{ headerShown: false }}>
//           {state.userToken == null ? (
//             <>
//               <Stack.Screen name="Login" component={LoginScreen} />
//               <Stack.Screen name="Register" component={RegisterScreen} />
//             </>
//           ) : (
//             <Stack.Screen name="Home" component={HomeScreen} />
//           )}
//         </Stack.Navigator>
//       </NavigationContainer>
//     </AuthContext.Provider>
//   );
// }



// code modifié
// frontend/App.js

import React, { useEffect, useMemo } from 'react';
import React, { useEffect, useMemo } from 'react'; // Removed useState as dispatch handles state
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, Text } from 'react-native';

// --- Import de tous les écrans ---
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen'; // La page Vidéo
import TranslationScreen from './screens/TranslationScreen'; // La page Traduction

import HomeScreen from './screens/HomeScreen';
import ProcessingScreen from './screens/ProcessingScreen';
import { getToken, logout } from './services/authService';
import { AuthContext } from './contexts/AuthContext';

const Stack = createStackNavigator();

// --- Ecrans temporaires (placeholders) ---
// Pour que l'application ne plante pas si les fichiers n'existent pas encore.
const SettingsScreen = () => <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><Text>Page Paramètres</Text></View>;
const HistoryScreen = () => <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><Text>Page Historique</Text></View>;


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
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          ) : (
            // Ecrans si l'utilisateur EST connecté
            <>
              {/* --- C'EST LA PARTIE IMPORTANTE --- */}
              {/* L'écran "Translation" est en premier pour qu'il s'affiche par défaut. */}
              <Stack.Screen name="Translation" component={TranslationScreen} />

              {/* Les autres écrans sont déclarés après */}
              <Stack.Screen name="Video" component={HomeScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="History" component={HistoryScreen} />
          <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Processing" component={ProcessingScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}