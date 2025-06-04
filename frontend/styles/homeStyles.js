// frontend/styles/homeStyles.js
import { StyleSheet } from 'react-native';

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10, // Adjusted padding slightly for home screen
    backgroundColor: '#f5f5f5',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: 'green', // Or another appropriate color
  },
  cameraContainer: {
    width: '90%',
    aspectRatio: 3 / 4, // Common aspect ratio for portrait photos
    overflow: 'hidden',
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc', // Slightly lighter border
    backgroundColor: '#000', // Background for the camera view area
  },
  camera: {
    flex: 1,
  },
  cameraButtonContainer: { // For buttons overlaid on the camera
    position: 'absolute', // Position over the camera
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around', // Space out buttons like flip and capture
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  // You might want separate styles for a capture button if it's different
  // e.g., a circular button
  captureButton: {
    // Styles for a dedicated capture button, if you add one
  },
  flipButtonText: { // If you want to style the text of the flip button
    fontSize: 18,
    marginBottom: 10,
    color: 'white',
  },
  previewImage: {
    width: 200,
    height: (200 * 4) / 3, // Maintain aspect ratio if it's portrait
    resizeMode: 'contain',
    marginVertical: 15,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 5,
  },
  logoutButtonContainer: { // To give the logout button some space or styling
    marginTop: 20,
    width: '60%', // Example width
  },
  centeredText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    padding: 20,
  },
  activityIndicatorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});