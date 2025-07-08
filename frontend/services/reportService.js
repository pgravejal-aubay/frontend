// frontend/services/reportService.js (nouveau fichier)
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://54.74.147.186:5000'; 

export const submitReport = async (reportData) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('No auth token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/report-error`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token, // Ajout du token d'authentification
      },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit report');
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting report:", error);
    throw error;
  }
};