// frontend/services/storageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'translation_history';
const SAVED_KEY = 'saved_translations';


export const getHistory = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(HISTORY_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Failed to load history.", e);
    return [];
  }
};

export const addToHistory = async (translationEntry) => { // La fonction accepte maintenant l'objet complet
  try {
    const history = await getHistory();

    // On n'a plus besoin de créer un nouvel objet, on utilise celui qui est passé en paramètre.
    
    // Ajoute la nouvelle traduction au début de la liste
    const updatedHistory = [translationEntry, ...history];
    
    // Limite l'historique à 100 entrées pour ne pas surcharger le stockage
    if (updatedHistory.length > 100) {
        updatedHistory.pop();
    }
    const jsonValue = JSON.stringify(updatedHistory);
    await AsyncStorage.setItem(HISTORY_KEY, jsonValue);
  } catch (e) {
    console.error("Failed to save to history.", e);
  }
};


export const getSavedTranslations = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(SAVED_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Failed to load saved translations.", e);
    return [];
  }
};

export const saveTranslation = async (translationToSave) => {
  try {
    const saved = await getSavedTranslations();
    // Vérifie si la traduction n'est pas déjà enregistrée
    const isAlreadySaved = saved.some(item => item.id === translationToSave.id);
    if (!isAlreadySaved) {
        const updatedSaved = [translationToSave, ...saved];
        const jsonValue = JSON.stringify(updatedSaved);
        await AsyncStorage.setItem(SAVED_KEY, jsonValue);
        return true; 
    }
    return false; 
  } catch (e) {
    console.error("Failed to save translation.", e);
    throw e;
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