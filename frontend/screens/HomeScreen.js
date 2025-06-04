// frontend/screens/HomeScreen.js
import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, Button, Image, Alert, ActivityIndicator, TouchableOpacity, Platform } from 'react-native'; // Keep Platform
import { Camera, CameraType } from 'expo-camera'; 
import { getUserData, fetchProtectedData } from '../services/authService';
import { AuthContext } from '../App';
import { homeStyles } from '../styles/homeStyles';

export default function HomeScreen({ navigation }) {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  // Initialize with string for web compatibility, or conditional on CameraType
  const [type, setType] = useState(
    Platform.OS === 'web' && !CameraType ? 'back' : (CameraType?.back || 'back')
  ); // Default to 'back' string if CameraType.back is undefined
  const [capturedImage, setCapturedImage] = useState(null);
  const cameraRef = useRef(null);
  const [userData, setUserDataState] = useState(null);
  const [protectedMessage, setProtectedMessage] = useState('');
  const [loading, setLoading] = useState(true); // Combined loading state
  const [cameraReady, setCameraReady] = useState(false); // New state for camera readiness

  const { signOut } = useContext(AuthContext);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true); // Start loading
      try {
        const cameraStatus = await Camera.requestCameraPermissionsAsync();
        if (isMounted) setHasCameraPermission(cameraStatus.status === 'granted');

        const uData = await getUserData();
        if (isMounted) setUserDataState(uData);

        // Only fetch protected data if we have a user (or token implies user)
        if (uData) { // Or check for token existence if uData might be initially null
            const pData = await fetchProtectedData();
            if (isMounted) setProtectedMessage(pData.message);
        }

      } catch (error) {
        console.error("HomeScreen Error:", error);
        if (isMounted) {
            Alert.alert(
              "Error",
              error.message?.includes("Token") || error.message?.includes("Network Error")
                ? "Session may be invalid or network issue. Please log in again."
                : "Could not load data.",
              [{ text: "OK", onPress: () => {
                  if (error.message?.includes("Token")){
                     signOut();
                  }
              }}]
            );
        }
      } finally {
        if (isMounted) setLoading(false); // Stop loading
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [signOut]); // signOut dependency

  const toggleCameraType = () => {
    setType(current => {
      // Use string comparison for web and robust handling
      if (Platform.OS === 'web' || !CameraType || !CameraType.front || !CameraType.back) {
        return current === 'back' ? 'front' : 'back';
      }
      // Use CameraType for native if available
      return current === CameraType.back ? CameraType.front : CameraType.back;
    });
  };

  const takePicture = async () => {
    if (cameraRef.current && cameraReady && !loading) {
      setLoading(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
        setCapturedImage(photo.uri);
      } catch (error) {
        console.error("Error taking picture: ", error);
        Alert.alert("Capture Error", "Could not take picture. Please try again.");
      } finally {
        setLoading(false);
      }
    } else if (!cameraReady) {
        Alert.alert("Camera Not Ready", "Please wait for the camera to initialize.");
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Handle loading state for permissions and data fetching
  if (loading && hasCameraPermission === null) {
    return <View style={homeStyles.activityIndicatorContainer}><ActivityIndicator size="large" color="#0000ff" /></View>;
  }

  if (hasCameraPermission === false) {
    return (
      <View style={homeStyles.container}>
        <Text style={homeStyles.centeredText}>
          No access to camera. Please enable camera permissions in your device settings for this app.
        </Text>
        <Button title="Grant Permission" onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(status === 'granted');
        }} />
        <View style={homeStyles.logoutButtonContainer}>
            <Button title="Logout" onPress={handleLogout} color="red" />
        </View>
      </View>
    );
  }

  // If permissions are granted but still loading data, show a loader
  if (loading) {
    return <View style={homeStyles.activityIndicatorContainer}><ActivityIndicator size="large" color="#0000ff" /></View>;
  }

  return (
    <View style={homeStyles.container}>
      <Text style={homeStyles.welcomeText}>Welcome, {userData?.username || 'User'}!</Text>
      {/* {protectedMessage && <Text style={homeStyles.infoText}>{protectedMessage}</Text>} */}

      <View style={homeStyles.cameraContainer}>
        <Camera
            style={homeStyles.camera}
            type={type} // This will now be 'front' or 'back' string, or CameraType enum value
            ref={cameraRef}
            onCameraReady={() => setCameraReady(true)} // Set camera ready state
            // ratio might be needed for Android, web usually adapts
            ratio={Platform.OS === 'android' ? "16:9" : undefined }
        >
          <View style={homeStyles.cameraButtonContainer}>
            {cameraReady && ( // Only show flip button if camera is ready
              <TouchableOpacity onPress={toggleCameraType} style={{padding: 10}}>
                  <Text style={homeStyles.flipButtonText}>Flip</Text>
              </TouchableOpacity>
            )}
          </View>
        </Camera>
        {!cameraReady && <ActivityIndicator size="small" color="#fff" style={{position: 'absolute', alignSelf: 'center', top: '50%'}}/>}
      </View>

      <Button title={loading ? "Processing..." : (cameraReady ? "Take Picture" : "Camera loading...")} onPress={takePicture} disabled={loading || !cameraReady} />

      {capturedImage && (
        <>
            <Image source={{ uri: capturedImage }} style={homeStyles.previewImage} />
            <Button title="Clear Preview" onPress={() => setCapturedImage(null)} />
        </>
      )}

      <View style={homeStyles.logoutButtonContainer}>
        <Button title="Logout" onPress={handleLogout} color="red" />
      </View>
    </View>
  );
}