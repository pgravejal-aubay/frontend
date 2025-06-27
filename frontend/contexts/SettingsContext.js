// frontend/contexts/SettingsContext.js
import React, { createContext, useState, useEffect } from 'react';
import * as Speech from 'expo-speech';
import { Appearance } from 'react-native';


// 1. Création du contexte
export const SettingsContext = createContext();

// 2. Création du fournisseur de contexte (Provider)
export const SettingsProvider = ({ children }) => {
  // États pour les paramètres vocaux
  const [availableVoices, setAvailableVoices] = useState([]);
  const [voice, setVoice] = useState(null);
  const [speechRate, setSpeechRate] = useState(1.0);

  // État pour le thème (light ou dark)
  const [theme, setTheme] = useState(Appearance.getColorScheme() || 'light');

  // Chargement des voix disponibles
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const frenchVoices = voices.filter(v => v.language === 'fr-FR');
        setAvailableVoices(frenchVoices);

        if (frenchVoices.length > 0) {
          const defaultMaleVoice = frenchVoices.find(v => v.gender === 'male');
          setVoice(defaultMaleVoice ? defaultMaleVoice.identifier : frenchVoices[0].identifier);
        }
      } catch (error) {
        console.error("Failed to load speech voices:", error);
      }
    };

    loadVoices();
  }, []);

  // Valeurs partagées dans le contexte
  const value = {
    voice,
    setVoice,
    speechRate,
    setSpeechRate,
    availableVoices,
    theme,
    setTheme, // Permet de changer manuellement le thème si besoin
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
