// frontend/styles/SettingsStyle.js
import { StyleSheet } from 'react-native';

// Supposition des couleurs. Remplace-les par tes couleurs de constants/Colors.js
const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: '#6750a4', // Ajusté pour correspondre à ton thème
    icon: '#687076',
    cardBackground: '#f0f0f0',
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: '#6750a4',
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
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
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
  userMenu: {
    position: 'absolute',
    top: 95,
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
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  preferenceLabel: {
    fontSize: 22,
  },
  sizeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    borderRadius: 8,
    padding: 4,
  },
  sizeButton: {
    padding: 0,
  },
  separator: {
    width: 1,
    height: 12,
    backgroundColor: '#a0a0a0',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    width: 168,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  policyButton: {
    height: 48, // Augmenté de 32 à 48 pour plus d'espace
    minWidth: 250, // Ajouté une largeur minimale pour s'assurer que le texte tient
    borderRadius: 8,
    borderColor: '#cac4d0',
    shadowColor: '#00000040',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    marginBottom: 8,
    paddingHorizontal: 12, // Ajouté du padding horizontal pour mieux distribuer le texte
    justifyContent: 'center', // Centrer verticalement le texte
  },
  policyText: {
    fontSize: 14,
    color: '#49454f',
    textAlign: 'center',
  },
  logoutButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  icon: {
    width: 16,
    height: 16,
  },
});