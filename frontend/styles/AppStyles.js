// frontend/styles/AppStyles.js

import { StyleSheet } from 'react-native';

const AppStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E8F84',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6d0d61',
  },
  loadingSubText: {
    marginTop: 5,
    fontSize: 14,
    color: '#ed9bd4',
  },
  logo: {
    width: 300, // Ajustez la largeur selon la taille de votre logo
    height: 300, // Ajustez la hauteur selon la taille de votre logo
    resizeMode: 'contain', // Assure que le logo s'adapte sans être coupé
    marginBottom: 30, // Ajoute un espace sous le logo
  },
});

export default AppStyles;
