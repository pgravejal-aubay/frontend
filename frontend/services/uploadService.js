import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const API_GENERAL_URL = 'http://10.0.2.2:5000/video';

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
  try {
    const video = videoAsset.assets[0];
    const fileUri = await copyToCache(video);

    const formData = new FormData();
    formData.append('video', {
      uri: fileUri,
      name: video.name || 'video.mp4',
      type: video.mimeType || 'video/mp4',
    });
    const response = await axios.post(`${API_GENERAL_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Upload Error:', error);
    throw error.response?.data || { message: 'Impossible to save video' };
  }
};
