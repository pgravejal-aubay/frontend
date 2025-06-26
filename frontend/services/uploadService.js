// frontend/services/uploadService.js
import axios from 'axios';
import { getApiUrl, getAuthHeaders } from './api';
import * as FileSystem from 'expo-file-system';

const copyToCache = async (video) => {
  const sourceUri = video.uri;
  const fileName = video.name || `video-${Date.now()}.${video.uri.split('.').pop()}`; // More robust filename
  const destPath = `${FileSystem.cacheDirectory}${fileName}`;

  try {
    await FileSystem.copyAsync({
      from: sourceUri,
      to: destPath,
    });
  } catch (e) {
    console.error("Error copying to cache:", e);
    throw e; // rethrow to be caught by caller
  }
  return destPath;
};

export const local_video = async (videoAsset, targetLanguage, pipelineChoice = 'v1') => {
  const apiUrl = getApiUrl('/video/upload');
  const headers = await getAuthHeaders(); // Ensure this correctly gets the token

  const fileUri = await copyToCache(videoAsset);

  const formData = new FormData();
  formData.append('video', {
    uri: fileUri,
    name: videoAsset.name || `video-${Date.now()}.${fileUri.split('.').pop()}`,
    type: videoAsset.mimeType || 'video/mp4', // Ensure mimeType is passed or default
  });
  formData.append('targetLang', targetLanguage);
  // Axios automatically handles Content-Type for FormData
  formData.append('pipeline_choice', pipelineChoice); // Send the choice

  console.log(`Uploading video for pipeline: ${pipelineChoice}`);
  console.log(`Video asset name: ${videoAsset.name}, uri: ${fileUri}, type: ${videoAsset.mimeType || 'video/mp4'}`);
  
  try {
    const response = await axios.post(apiUrl, formData, {
      headers: {
        ...headers, // This should include 'x-access-token' if user is logged in
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // Increased timeout for upload
    });
    return response.data;
  } catch (error) {
    console.error("Upload service error:", error.response?.data || error.message);
    if (error.isAxiosError && error.response) {
         console.error("Axios error details:", {
            status: error.response.status,
            headers: error.response.headers,
            config: error.config
         });
    }
    throw error.response?.data || { message: `Failed to upload video: ${error.message}` };
  }
};

export const checkTaskStatus = async (taskId) => {
  const apiUrl = getApiUrl(`/api/task/status/${taskId}`);
  const headers = await getAuthHeaders();

  try {
    const response = await axios.get(apiUrl, { headers });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to check status.' };
  }
};

export const cancelTask = async (taskId) => {
  const apiUrl = getApiUrl(`/api/task/cancel/${taskId}`);
  const headers = await getAuthHeaders();

  try {
    const response = await axios.post(apiUrl, null, { headers });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to cancel task.' };
  }
};
