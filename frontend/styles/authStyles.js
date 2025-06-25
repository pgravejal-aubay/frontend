// frontend/styles/authStyles.js
import { StyleSheet } from 'react-native';

const COLORS = {
  primary: '#2D2D2D',
  white: '#FFFFFF',
  lightGray: '#F7F7F7',
  mediumGray: '#E0E0E0',
  darkGray: '#666',
  textPrimary: '#1F1F1F',
  textSecondary: '#555',
  error: '#D93025',
};

export const authStyles = StyleSheet.create({
  // --- Conteneurs & Layout (LA PARTIE LA PLUS IMPORTANTE) ---
  screen: {
    flex: 1, // Essentiel : pour que l'écran prenne toute la hauteur
    backgroundColor: COLORS.lightGray,
  },
  keyboardAvoidingContainer: {
    flex: 1, // Essentiel : pour que le conteneur prenne toute la place disponible
  },
  centeredContainer: {
    flex: 1, // Essentiel : prend toute la hauteur
    justifyContent: 'center', // Essentiel : Centre le contenu verticalement
    paddingHorizontal: 20,
  },
  scrollableContainer: {
    flexGrow: 1, // Permet au contenu de grandir
    justifyContent: 'center', // Centre le contenu si la page n'est pas assez remplie pour scroller
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },

  // --- Titres & Textes ---
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitleContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  subtitleLink: {
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },

  // --- Formulaire ---
  label: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#000', // Assure que le texte saisi est noir
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
  },

  // --- Boutons & Liens ---
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryLink: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },

  // --- Messages & Indicateurs ---
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
});