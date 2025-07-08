// frontend/service/api.js

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://54.74.147.186:5000';

export const getApiUrl = (route) => {
    return `${API_BASE_URL}${route}`;
};

export const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['x-access-token'] = token;
    }

    return headers;
};

export const checkAiStatus = async () => {
    try {
      const response = await fetch(getApiUrl('/hello'));
      return response.ok;
    } catch (error) {
      return false; // Le backend n'est pas joignable en cas d'erreur réseau
    }
};
