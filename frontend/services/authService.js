// frontend/services/authService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


// frontend/services/authService.js
const API_URL = 'http://10.0.2.2:5000/auth';
const API_GENERAL_URL = 'http://10.0.2.2:5000/api';

export const register = async (prenom, nom, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      prenom,
      nom,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      username,
      password,
    });
    if (response.data.token) {
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify({username: response.data.username, email: response.data.email}));
    }
    return response.data;
  } catch (error)
   {
    throw error.response?.data || { message: 'Login failed' };
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem('userToken');
  await AsyncStorage.removeItem('userData');
};

export const getToken = async () => {
  return await AsyncStorage.getItem('userToken');
};

export const getUserData = async () => {
    const userDataJson = await AsyncStorage.getItem('userData');
    return userDataJson ? JSON.parse(userDataJson) : null;
}

export const fetchProtectedData = async () => {
    console.log("authService: Attempting to fetch protected data...");
    const token = await getToken();
    console.log("authService: Token for protected data:", token);

    if (!token) {
        console.warn("authService: No token found for protected data.");
        throw new Error("No token found");
    }

    try {
        console.log(`authService: Calling GET ${API_GENERAL_URL}/protected`);
        const response = await axios.get(`${API_GENERAL_URL}/protected`, {
            headers: { 'x-access-token': token },
            timeout: 15000 // 15 second timeout - INCREASED FOR DEBUGGING
        });
        console.log("authService: Successfully fetched protected data:", response.data);
        return response.data;
    } catch (error) {
        console.error("authService: Error fetching protected data. Details:", {
            message: error.message,
            code: error.code, // e.g., 'ECONNABORTED' for timeout
            isAxiosError: error.isAxiosError,
            requestUrl: error.config?.url,
            requestMethod: error.config?.method,
            responseStatus: error.response?.status,
            responseData: error.response?.data,
        });
        if (error.response?.status === 401) { // Token might be expired or invalid
            console.log("authService: Token invalid (401), attempting logout.");
            await logout();
        }
        // Rethrow a more user-friendly or specific error
        if (error.code === 'ECONNABORTED') {
             throw { message: 'Request timed out. Please check your network and backend server.' };
        }
        throw error.response?.data || { message: `Failed to fetch protected data: ${error.message || 'Unknown network error'}` };
    }
};