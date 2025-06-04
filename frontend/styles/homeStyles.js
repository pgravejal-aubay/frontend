// frontend/styles/homeStyles.js
import { StyleSheet } from 'react-native';

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
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
    color: 'green', 
  },
  cameraContainer: {
    width: '90%',
    aspectRatio: 3 / 4,
    overflow: 'hidden',
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraButtonContainer: {
    position: 'absolute', 
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around', 
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  captureButton: {
    // Styles for a dedicated capture button
  },
  flipButtonText: {
    fontSize: 18,
    marginBottom: 10,
    color: 'white',
  },
  previewImage: {
    width: 200,
    height: (200 * 4) / 3, 
    resizeMode: 'contain',
    marginVertical: 15,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 5,
  },
  logoutButtonContainer: { // To give the logout button some space or styling
    marginTop: 20,
    width: '60%',
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