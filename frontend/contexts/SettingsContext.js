// frontend/contexts/SettingsContext.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useEffect } from 'react';
import * as Speech from 'expo-speech';

// 1. Création du contexte
export const SettingsContext = createContext();

// 2. Création du fournisseur de contexte (Provider)
export const SettingsProvider = ({ children }) => {
  // États pour les paramètres
  const [availableVoices, setAvailableVoices] = useState([]);
  const [voice, setVoice] = useState(null); // Stocke l'identifiant de la voix
  const [speechRate, setSpeechRate] = useState(1.0); // Vitesse de lecture (1.0 = normale)
  const [theme, setThemeState] = useState('light');

  // Au premier chargement de l'app, on récupère les voix disponibles
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const frenchVoices = voices.filter(v => v.language === 'fr-FR');
        setAvailableVoices(frenchVoices);
        if (frenchVoices.length > 0) {
          const defaultMaleVoice = frenchVoices.find(v => v.gender === 'male');
          if (defaultMaleVoice) {
            setVoice(defaultMaleVoice.identifier);
          } else {
            setVoice(frenchVoices[0].identifier);
          }
        }
      } catch (error) {
        console.error("Failed to load speech voices:", error);
      }
    };
    loadVoices();

    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) setThemeState(savedTheme);
      } catch (error) {
        console.error("Failed to load theme:", error);
      }
    };
    loadTheme();
  }, []);

  // Valeurs partagées dans le contexte
  const value = {
    voice,
    setVoice,
    speechRate,
    setSpeechRate,
    availableVoices,
    theme,
    setTheme: async (newTheme) => {
      setThemeState(newTheme);
      try {
        await AsyncStorage.setItem('theme', newTheme);
      } catch (error) {
        console.error("Failed to save theme:", error);
      }
    },
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
