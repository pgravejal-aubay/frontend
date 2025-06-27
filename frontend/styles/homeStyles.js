import { StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';

export const homeStyles = (theme = 'light') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors[theme].background,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors[theme].background,
  },
  pickerContainer: {
    width: '42%',
    height: 45,
    borderWidth: 1,
    borderColor: Colors[theme].border,
    borderRadius: 8,
    justifyContent: 'center',
    backgroundColor: Colors[theme].cardBackground,
  },
  picker: {
    width: '100%',
    color: Colors[theme].text,
  },
  cameraPreview: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Colors[theme].border,
  },
  timerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    color: 'white',
    fontSize: 96,
    fontWeight: 'bold',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 30,
    backgroundColor: Colors[theme].background,
  },
  sideControls: {
    gap: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors[theme].cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors[theme].cardBackground,
  },
  recordInnerWhite: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
  },
  recordInnerRed: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'red',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors[theme].background,
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: Colors[theme].text,
  },
});
