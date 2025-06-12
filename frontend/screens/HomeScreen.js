// frontend/screens/HomeScreen.js
import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, Button, Image, Alert, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera'; // Use CameraView and hook
import { getUserData, fetchProtectedData } from '../services/authService';
import { AuthContext } from '../contexts/AuthContext'; // Add this line (correct path)
import { homeStyles } from '../styles/homeStyles';

export default function HomeScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back'); // 'facing' prop uses 'front' or 'back'

  const [capturedImage, setCapturedImage] = useState(null);
  const cameraRef = useRef(null);
  const [userData, setUserDataState] = useState(null);
  const [protectedMessage, setProtectedMessage] = useState(''); // Keep for potential future use or debugging
  const [loadingData, setLoadingData] = useState(true); // Specific loading state for data
  const [takingPicture, setTakingPicture] = useState(false); // Specific for picture process
  const [cameraReady, setCameraReady] = useState(false);

  const { signOut } = useContext(AuthContext);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!isMounted) return;
      setLoadingData(true);
      try {
        // Permission is requested via UI if not granted.
        // Initial permission status is available in 'permission' object.

        const uData = await getUserData();
        if (isMounted) setUserDataState(uData);

        if (uData) { // Only fetch protected data if user data is available (implies logged in)
            const pData = await fetchProtectedData();
            if (isMounted) setProtectedMessage(pData.message);
        } else {
            // If no user data, it might indicate an issue, potentially sign out
            console.warn("HomeScreen: No user data found on load.");
            // signOut(); // Consider if this is the right place or if App.js handles it
        }

      } catch (error) {
        console.error("HomeScreen Error:", error);
        if (isMounted) {
            const isAuthError = error.message?.includes("Token") || error.message?.includes("401") || error.message?.includes("No token found");
            Alert.alert(
              "Error",
              isAuthError
                ? "Your session may have expired or there was a network issue. Please log in again."
                : "Could not load user data. Please try again later.",
              [{ text: "OK", onPress: () => {
                  if (isAuthError){
                     signOut();
                  }
              }}]
            );
        }
      } finally {
        if (isMounted) setLoadingData(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [signOut]); // Add 'permission' if you want to reload data when permission changes

  const toggleCameraType = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (cameraRef.current && cameraReady && !takingPicture) {
      setTakingPicture(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7,  skipProcessing: true });
        setCapturedImage(photo.uri);
      } catch (error) {
        console.error("Error taking picture: ", error);
        Alert.alert("Capture Error", "Could not take picture. Please try again.");
      } finally {
        setTakingPicture(false);
      }
    } else if (!cameraReady) {
        Alert.alert("Camera Not Ready", "Please wait for the camera to initialize.");
    } else if (takingPicture) {
        // Already processing, do nothing or show feedback
    }
  };

  const handleLogout = async () => {
    await signOut();
    // Navigation to Login screen will be handled by App.js due to userToken becoming null
  };

  if (!permission) {
    // Permissions are still loading (useCameraPermissions hook might take a moment)
    return <View style={homeStyles.activityIndicatorContainer}><ActivityIndicator size="large" color="#0000ff" /></View>;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={homeStyles.container}>
        <Text style={homeStyles.centeredText}>
          We need your permission to show the camera. Please grant camera access.
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
        <View style={homeStyles.logoutButtonContainer}>
            <Button title="Logout" onPress={handleLogout} color="red" />
        </View>
      </View>
    );
  }

  // Permissions are granted. Now check if data is still loading.
  if (loadingData) {
    return <View style={homeStyles.activityIndicatorContainer}><ActivityIndicator size="large" color="#0000ff" /></View>;
  }

  return (
    <View style={homeStyles.container}>
      <Text style={homeStyles.welcomeText}>Welcome, {userData?.username || 'User'}!</Text>
      {/* {protectedMessage && <Text style={homeStyles.infoText}>{protectedMessage}</Text>} */}

      <View style={homeStyles.cameraContainer}>
        <CameraView // Use CameraView
            style={homeStyles.camera}
            facing={facing} // Use 'facing' prop
            ref={cameraRef}
            onCameraReady={() => {
                console.log("Camera is ready");
                setCameraReady(true);
            }}
            mode="picture" // Explicitly set mode, can also be 'video'
            // 'ratio' prop is deprecated for CameraView. Aspect ratio is usually handled by the view style or default behavior.
            // If you need specific picture sizes, use the 'pictureSize' prop.
        >
          <View style={homeStyles.cameraButtonContainer}>
            {cameraReady && (
              <TouchableOpacity onPress={toggleCameraType} style={{padding: 10, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 5}}>
                  <Text style={homeStyles.flipButtonText}>Flip</Text>
              </TouchableOpacity>
            )}
          </View>
        </CameraView>
        {!cameraReady && permission.granted && // Show loader only if permission granted but camera not ready
            <ActivityIndicator size="small" color="#fff" style={{position: 'absolute', alignSelf: 'center', top: '50%'}}/>
        }
      </View>

      <Button
        title={takingPicture ? "Processing..." : (cameraReady ? "Take Picture" : "Camera Initializing...")}
        onPress={takePicture}
        disabled={takingPicture || !cameraReady}
      />

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