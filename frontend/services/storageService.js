// frontend/services/storageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const HISTORY_KEY = 'translation_history';
const SAVED_KEY = 'saved_translations';
const HISTORY_ENABLED_KEY = 'history_enabled_status';
const API_BASE_URL = 'http://10.0.2.2:5000';

export const getHistory = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(HISTORY_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Failed to load history.", e);
    return [];
  }
};

export const addToHistory = async (translationEntry) => {
  try {
    const isEnabled = await getHistoryEnabledStatus();
    if (!isEnabled) return;
    const history = await getHistory();
    const updatedHistory = [translationEntry, ...history];

    if (updatedHistory.length > 5) {
        updatedHistory.pop();
    }
    const jsonValue = JSON.stringify(updatedHistory);
    await AsyncStorage.setItem(HISTORY_KEY, jsonValue);
  } catch (e) {
    console.error("Failed to save to history.", e);
  }
};

export const getHistoryEnabledStatus = async () => {
  try {
    const status = await AsyncStorage.getItem(HISTORY_ENABLED_KEY);
    // Si status est null (nouvel utilisateur), on retourne true.
    if (status === null) {
      return true;
    }
    // Sinon, on retourne la valeur booléenne sauvegardée.
    return JSON.parse(status);
  } catch (e) {
    console.error("Failed to load history status.", e);
    return true; // En cas d'erreur, on active par sécurité.
  }
};

export const setHistoryEnabledStatus = async (isEnabled) => {
  try {
    await AsyncStorage.setItem(HISTORY_ENABLED_KEY, JSON.stringify(isEnabled));
  } catch (e) {
    console.error("Failed to save history status.", e);
  }
};

export const getSavedTranslations = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const response = await axios.post(`${API_BASE_URL}/translation/get`, {
      token,
    });
      return response.data.translations || [];

  } catch (error) {
    console.error("Failed to load saved translations from the backend with Axios:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.data || error.message);
    }
    return [];
  }
};

export const saveTranslation = async (translationToSave) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    console.log(translationToSave)
    if (!token) {
      console.warn("Aucun token trouvé. Impossible de sauvegarder la traduction.");
      return false;
    }
    const saved = await getSavedTranslations();
    console.log(saved)
    const isAlreadySaved = saved.some(item =>
      item.originalText === translationToSave.originalText &&
      item.translatedText === translationToSave.translatedText);

    if (isAlreadySaved) {
      console.log("Traduction déjà sauvegardée.");
      return false; 
    }
    const response = await axios.post(`${API_BASE_URL}/translation/save`, {
      token: token,
      original_text: translationToSave.originalText,
      translate_text: translationToSave.translatedText,
      sourceLang: translationToSave.sourceLang,
      target_lang: translationToSave.targetLang,
    });

    if (response.status === 200 || response.status === 201) {
      console.log("Traduction sauvegardée avec succès sur le backend :", response.data);
      return true;
    } else {
      console.error("Le backend a renvoyé un statut inattendu :", response.status, response.data);
      return false;
    }

  } catch (error) {
    console.error("Échec de la sauvegarde de la traduction via le backend:", error);
    if (axios.isAxiosError(error)) {
      console.error("Détails de l'erreur Axios :", error.response?.data || error.message);
    }
    throw error;
  }
};

export const clearHistory = async () => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
    await AsyncStorage.removeItem(SAVED_KEY);
    console.log("History cleared successfully.");
  } catch (e) {
    console.error("Failed to clear history.", e);
  }
};

export const removeSavedTranslation = async (translationId) => {
    try {
        let saved = await getSavedTranslations();
        saved = saved.filter(item => item.id !== translationId);
        const jsonValue = JSON.stringify(saved);
        await AsyncStorage.setItem(SAVED_KEY, jsonValue);
    } catch(e) {
        console.error("Failed to remove saved translation.", e);
    }
}