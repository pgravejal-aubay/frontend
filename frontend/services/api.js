import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.0.2.2:5000';

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