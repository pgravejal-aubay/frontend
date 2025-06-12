// frontend/App.js
import React, { useEffect, useMemo } from 'react'; // Removed useState as dispatch handles state
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native'; // Removed StyleSheet

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import { getToken, logout } from './services/authService';
// import { AuthContext } from './App'; // Remove this line
import { AuthContext } from './contexts/AuthContext'; // Add this line

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
            isLoading: false, // Ensure loading is false
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
            isLoading: false, // Ensure loading is false
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
        console.error("Failed to restore token", e);
        // Restoring token failed
      }
      dispatch({ type: 'RESTORE_TOKEN', token: userToken });
    };
    bootstrapAsync();
  }, []);

  const authContext = useMemo(
    () => ({
      signIn: async () => { // Called by LoginScreen after authService.login stores the token
        const token = await getToken(); // Read the token that was just stored
        dispatch({ type: 'SIGN_IN', token: token });
      },
      signOut: async () => {
        await logout();
        dispatch({ type: 'SIGN_OUT' });
      },
      signUp: async (data) => {
        // This is a placeholder. If sign-up should auto-login,
        // it would call the register service, then potentially signIn.
      },
    }),
    []
  );

  // Removed the potentially problematic useEffect that re-called signIn on token change.
  // RESTORE_TOKEN and the signIn action in LoginScreen handle token state updates sufficiently.

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
            <Stack.Screen name="Home" component={HomeScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}