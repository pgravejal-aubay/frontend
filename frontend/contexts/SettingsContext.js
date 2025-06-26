// frontend/contexts/SettingsContext.js
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

  // Au premier chargement de l'app, on récupère les voix disponibles
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        // On ne garde que les voix françaises pour notre application
        const frenchVoices = voices.filter(v => v.language === 'fr-FR');
        setAvailableVoices(frenchVoices);

        // Si des voix françaises sont disponibles, on en définit une par défaut
        if (frenchVoices.length > 0) {
          // On essaie de trouver une voix masculine comme premier choix
          const defaultMaleVoice = frenchVoices.find(v => v.gender === 'male');
          if (defaultMaleVoice) {
            setVoice(defaultMaleVoice.identifier);
          } else {
            // Sinon, on prend la première de la liste
            setVoice(frenchVoices[0].identifier);
          }
        }
      } catch (error) {
        console.error("Failed to load speech voices:", error);
      }
    };

    loadVoices();
  }, []); // Le tableau vide [] signifie que cet effet ne s'exécute qu'une seule fois

  // On rassemble les valeurs et fonctions à partager dans l'application
  const value = {
    voice,
    setVoice,
    speechRate,
    setSpeechRate,
    availableVoices,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};