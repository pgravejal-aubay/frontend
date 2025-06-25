// frontend/styles/authStyles.js
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const authStyles = (theme = 'light') => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: Colors[theme].background, // #40e0d0 (clair) ou #27b2a4 (sombre)
  },
  title: {
    fontSize: 28,
    color: Colors[theme].text, // #eb76c7
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors[theme].text, // #eb76c7
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: Colors[theme].cardBackground, // #6d0d61
    borderWidth: 1,
    borderColor: Colors[theme].border, // #6d0d61
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: Colors[theme].text, // #eb76c7
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: Colors[theme].cardBackground, // #6d0d61
    borderWidth: 1,
    borderColor: Colors[theme].border, // #6d0d61
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputInWrapper: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: Colors[theme].text, // #eb76c7
  },
  eyeIcon: {},
  registerButton: {
    backgroundColor: Colors[theme].buttonBackground, // #6d0d61
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  registerButtonText: {
    color: Colors[theme].text, // #eb76c7
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red', // Conserver pour lisibilité
    marginBottom: 15,
    textAlign: 'center',
  },
  linkButtonText: {
    color: Colors[theme].text, // #eb76c7
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
  },
  legalSectionContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 25,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legalText: {
    fontSize: 12,
    color: Colors[theme].text, // #eb76c7
    lineHeight: 18,
  },
  legalLink: {
    fontSize: 12,
    color: Colors[theme].text, // #eb76c7
    textDecorationLine: 'underline',
    lineHeight: 18,
  },
});