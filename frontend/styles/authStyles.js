// frontend/styles/authStyles.js
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const authStyles = (theme = 'light') => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors[theme].background, // #40e0d0 (clair) ou #27b2a4 (sombre)
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    color: Colors[theme].text, // #6d0d61
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  subtitleContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: Colors[theme].text, // #6d0d61
  },
  subtitleLink: {
    fontWeight: 'bold',
    color: Colors[theme].text, // #6d0d61
  },
  label: {
    fontSize: 14,
    color: Colors[theme].text, // #6d0d61
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 48,
    backgroundColor: Colors[theme].cardBackground, // #ed9bd4
    borderWidth: 1,
    borderColor: Colors[theme].border, // #ed9bd4
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors[theme].text, // #6d0d61
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: Colors[theme].cardBackground, // #ed9bd4
    borderWidth: 1,
    borderColor: Colors[theme].border, // #ed9bd4
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors[theme].text, // #6d0d61
  },
  primaryButton: {
    backgroundColor: Colors[theme].buttonBackground, // #ed9bd4
    paddingVertical: 15,
    paddingHorizontal: 20, // Ajout de marge horizontale
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    color: Colors[theme].text, // #6d0d61
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryLink: {
    fontSize: 14,
    color: Colors[theme].text, // #6d0d61
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  legalSectionContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 25,
    maxWidth: '90%', // Limite la largeur pour éviter le débordement
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap', // Permet le retour à la ligne
    textAlign: 'center',
  },
  legalText: {
    fontSize: 12,
    color: Colors[theme].text, // #6d0d61
    lineHeight: 18,
  },
  legalLink: {
    fontSize: 12,
    color: Colors[theme].text, // #6d0d61
    textDecorationLine: 'underline',
    lineHeight: 18,
  },
});