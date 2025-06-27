// frontend/styles/homeStyles.js
import { StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';

export const homeStyles = (theme = 'light') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors[theme].background, // #40e0d0 (clair) ou #27b2a4 (sombre)
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors[theme].background, // #40e0d0 ou #27b2a4
  },
  pickerContainer: {
    width: '42%',
    height: 45,
    borderWidth: 1,
    borderColor: Colors[theme].border, // #6d0d61
    borderRadius: 8,
    justifyContent: 'center',
    backgroundColor: Colors[theme].buttonBackground,
  },
  picker: {
    width: '100%',
  },
  cameraPreview: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Colors[theme].cardBackground, // #6d0d61
  },
  timerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    color: Colors[theme].text, // #eb76c7
    fontSize: 96,
    fontWeight: 'bold',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 30,
    backgroundColor: Colors[theme].background, // #40e0d0 ou #27b2a4
  },
  sideControls: {
    gap: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors[theme].buttonBackground, // #6d0d61
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors[theme].buttonBackground, // #6d0d61
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2, // Cercle extérieur noir
    borderColor: 'black', // Noir pour le cercle extérieur
  },
  recordInnerWhite: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#d3d3d3', // Gris pour le cercle intérieur
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordInnerRed: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'red', // Conserver pour contraste
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    color: Colors[theme].text, // #eb76c7
    textAlign: 'center',
    marginBottom: 20,
  },
});