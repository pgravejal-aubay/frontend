import axios from 'axios';
import { getApiUrl, getAuthHeaders } from './api';

const API_GENERAL_URL = 'http://10.0.2.2:5000/api';

/* Old version using axios
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
*/

export const local_video = async (videoAsset) => {
  const apiUrl = getApiUrl('/api/upload');
  const headers = await getAuthHeaders();
  
  const formData = new FormData();

  formData.append('video', {
    uri: videoAsset.uri,
    name: videoAsset.name,
    type: videoAsset.mimeType || 'video/mp4',
  });

  delete headers['Content-Type'];

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to upload video.');
  }
  
  return data;
};


export const checkTaskStatus = async (taskId) => {
  const apiUrl = getApiUrl(`/api/task/status/${taskId}`);
  const headers = await getAuthHeaders();
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to check status.');
  }
  return data;
};

export const cancelTask = async (taskId) => {
  const apiUrl = getApiUrl(`/api/task/cancel/${taskId}`);
  const headers = await getAuthHeaders();
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to cancel task.');
  }
  return data;
};