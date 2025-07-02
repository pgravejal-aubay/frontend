// styles/coverStyles.js
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const styles = (theme = 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "FFFFFF",
    justifyContent: 'center', // Centrer verticalement le contenu
    alignItems: 'center', // Centrer horizontalement le contenu
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 50,
  },

  buttonContainer: {
    alignItems: 'center',
    paddingBottom: 200, // Garde l'espace en bas pour les boutons
  },
  loginButton: {
    backgroundColor: Colors[theme].buttonBackground, // #6d0d61
    borderWidth: 1,
    borderColor: Colors[theme].border, // #6d0d61
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2.22,
    elevation: 3,
  },
  loginButtonText: {
    color: Colors[theme].text, // #eb76c7
    fontSize: 16,
    fontWeight: '500',
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowText: {
    color: Colors[theme].text, // #eb76c7
    fontSize: 22,
    fontWeight: 'bold',
    marginRight: 5,
    transform: [{ translateY: -2 }],
  },
  linkText: {
    color: Colors[theme].text, // #eb76c7
    fontSize: 14,
  },
});
