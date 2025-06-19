// Dans styles/translationStyles.ts

import { StyleSheet } from 'react-native';

// Supposition des couleurs. Remplace-les par tes couleurs de constants/Colors.ts
const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: '#007AFF', // Une couleur d'accentuation
    icon: '#687076',
    cardBackground: '#f0f0f0',
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: '#007AFF',
    icon: '#98a0a6',
    cardBackground: '#1c1c1e',
  },
};

// Pour cet exemple, j'utilise le thème clair.
const theme = Colors.light;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  // --- Header ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50, // Ajuster pour la barre de statut (SafeAreaView est mieux)
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  // --- Menu utilisateur (Modal/Dropdown) ---
  userMenu: {
    position: 'absolute',
    top: 95, // Positionner sous l'icône utilisateur
    left: 20,
    backgroundColor: theme.background,
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  menuItemText: {
    fontSize: 16,
    color: theme.text,
  },
  // --- Main Content ---
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  translationBox: {
    flex: 1,
    backgroundColor: theme.cardBackground,
    borderRadius: 20,
    padding: 20,
  },
  translationText: {
    fontSize: 24,
    color: theme.text,
    lineHeight: 34,
  },
  // --- Footer ---
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: theme.cardBackground,
  },
  footerActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});