// frontend/styles/processingStyles.js
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const processingStyles = (theme = 'light') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors[theme].background, // #40e0d0 (clair) ou #27b2a4 (sombre)
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 32,
    color: Colors[theme].text, // #eb76c7
    textAlign: 'center',
    lineHeight: 43.2,
  },
  cancelButton: {
    position: 'absolute',
    top: 60,
    right: 30,
    backgroundColor: Colors[theme].buttonBackground, // #6d0d61
    borderRadius: 8,
    padding: 10,
  },
});