// frontend/services/authService.js
import axios from 'axios';

// frontend/services/authService.js
const API_GENERAL_URL = 'http://10.0.2.2:5000/api';

export const local_video = async (video) => {
  try {
    const response = await axios.post(`${API_GENERAL_URL}/upload`, {
      video,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Impossible to save your video' };
  }
};

