// frontend/services/authService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Replace with your computer's local IP address
const API_URL = 'http://172.17.46.8:5000/auth'; // <--- CHANGE THIS!
const API_GENERAL_URL = 'http://172.17.46.8:5000/api'; // <--- CHANGE THIS!

export const register = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      username,
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
    const token = await getToken();
    if (!token) throw new Error("No token found");

    try {
        const response = await axios.get(`${API_GENERAL_URL}/protected`, {
            headers: { 'x-access-token': token }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching protected data:", error.response?.data || error.message);
        if (error.response?.status === 401) { // Token might be expired or invalid
            await logout(); // Log out user if token is bad
        }
        throw error.response?.data || { message: 'Failed to fetch protected data' };
    }
};