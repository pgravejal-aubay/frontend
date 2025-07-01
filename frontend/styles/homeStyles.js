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
    backgroundColor: 'black', // <-- MODIFICATION 1 : Masque le fond turquoise de la page
  },
  cameraOverlayContainer: {
    ...StyleSheet.absoluteFillObject, // Raccourci pour position: 'absolute', top:0, left:0, right:0, bottom:0
    justifyContent: 'center',        // Centre verticalement
    alignItems: 'center',            // Centre horizontalement
  },
    cameraOverlayImage: {
        position: 'contains',
        top: 0,
        left: 0,
        width: '90%',
        height: '90%',
        opacity: 0.7, // Opacité de l'image (ajustez selon vos préférences)
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
    backgroundColor: Colors[theme].recordOff,
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