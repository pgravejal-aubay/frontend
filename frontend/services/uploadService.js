import axios from 'axios';
import { getApiUrl, getAuthHeaders } from './api';
import * as FileSystem from 'expo-file-system';

const copyToCache = async (video) => {
  const sourceUri = video.uri;
  const fileName = video.name || 'video.mp4';
  const destPath = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.copyAsync({
    from: sourceUri,
    to: destPath,
  });

  return destPath;
};

export const local_video = async (videoAsset) => {
  const apiUrl = getApiUrl('/video/upload');
  const headers = await getAuthHeaders();

  const fileUri = await copyToCache(videoAsset);

  const formData = new FormData();
  formData.append('video', {
    uri: fileUri,
    name: videoAsset.name || 'video.mp4',
    type: videoAsset.mimeType || 'video/mp4',
  });

  // Axios gère automatiquement le Content-Type pour FormData
  try {
    const response = await axios.post(apiUrl, formData, {
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Échec de l’envoi de la vidéo.' };
  }
};

export const checkTaskStatus = async (taskId) => {
  const apiUrl = getApiUrl(`/api/task/status/${taskId}`);
  const headers = await getAuthHeaders();

  try {
    const response = await axios.get(apiUrl, { headers });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Échec de la vérification du statut.' };
  }
};

export const cancelTask = async (taskId) => {
  const apiUrl = getApiUrl(`/api/task/cancel/${taskId}`);
  const headers = await getAuthHeaders();

  try {
    const response = await axios.post(apiUrl, null, { headers });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Échec de l’annulation de la tâche.' };
  }
};
