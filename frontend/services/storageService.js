// frontend/services/storageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const HISTORY_KEY = 'translation_history';
const SAVED_KEY = 'saved_translations';
const HISTORY_ENABLED_KEY = 'history_enabled_status';
const API_BASE_URL = 'http://10.0.2.2:5000'; // Ensure this URL is correct for your backend

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

    // Ensure property names are consistent for the backend
    const entryToSave = {
      original_text: translationEntry.originalText,
      translate_text: translationEntry.translatedText,
      source_language: translationEntry.sourceLang,
      target_language: translationEntry.targetLang,
    };

    const updatedHistory = [entryToSave, ...history];

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
    if (status === null) {
      return true; // History enabled by default for new users
    }
    return JSON.parse(status);
  } catch (e) {
    console.error("Failed to load history status.", e);
    return true; // Enable history in case of error for safety
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

    if (!token) {
      console.warn("No token found. Cannot retrieve user-specific translations.");
      return []; 
    }

    const response = await axios.post(`${API_BASE_URL}/translation/get`, {
      token,
    });
    // Check that the backend response correctly contains 'translations' and that it is an array
    if (response.data && Array.isArray(response.data.translations)) {
        return response.data.translations;
    } else {
        console.warn("API response structure for saved translations is unexpected:", response.data);
        return [];
    }

  } catch (error) {
    console.error("Failed to load saved translations from the backend with Axios:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.status, error.response?.data || error.message);
    }
    return [];
  }
};

export const saveTranslation = async (translationToSave) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    console.log("Translation to save (frontend) :", translationToSave); 

    if (!token) {
      console.warn("No token found. Cannot save translation.");
      return false;
    }

    const saved = await getSavedTranslations(); 
    console.log("Saved translations from backend :", saved); 

    const isAlreadySaved = saved.some(item =>
      item.original_text === translationToSave.originalText &&
      item.translate_text === translationToSave.translatedText &&
      item.source_language === translationToSave.sourceLang &&
      item.target_language === translationToSave.targetLang
    );

    if (isAlreadySaved) {
      console.log("Translation already saved on the backend.");
      return false; 
    }

    const response = await axios.post(`${API_BASE_URL}/translation/save`, {
      token: token,
      original_text: translationToSave.originalText,
      translate_text: translationToSave.translatedText,
      source_language: translationToSave.sourceLang,
      target_language: translationToSave.targetLang,
    });

    if (response.status === 200 || response.status === 201) {
      console.log("Translation successfully saved to backend:", response.data);
      return true;
    } else {
      console.error("Backend returned an unexpected status:", response.status, response.data);
      return false;
    }

  } catch (error) {
    console.error("Failed to save translation via backend:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.status, error.response?.data || error.message);
    }
    throw error; 
  }
};

export const clearSaved = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      console.error("No token found. Cannot clear saved translations.");
      return false;
    }

    const response = await axios.post(`${API_BASE_URL}/translation/clear`, {
      token: token,
    });

    if (response.status === 200) {
      console.log("All translations successfully cleared on the backend.");
      return true;
    } else {
      console.error("Backend returned an unexpected status during clear operation:", response.status, response.data);
      return false;
    }

  } catch (error) {
    console.error("Failed to clear saved translations via backend:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.status, error.response?.data || error.message);
    }
    return false;
  }
};

export const clearHistory = async () => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
    console.log("History cleared successfully.");
  } catch (e) {
    console.error("Failed to clear history.", e);
  }
};