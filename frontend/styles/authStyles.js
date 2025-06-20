// // frontend/styles/authStyles.js
// import { StyleSheet } from 'react-native';

// export const authStyles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: '#f5f5f5',
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: '#333',
//   },
//   input: {
//     width: '100%',
//     height: 50,
//     backgroundColor: 'white',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     paddingHorizontal: 15,
//     marginBottom: 15,
//     fontSize: 16,
//   },
//   buttonContainer: {
//     marginTop: 10,
//     width: '80%',
//   },
//   errorText: {
//     color: 'red',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   linkButtonText: {
//     color: 'blue',
//     marginTop: 15,
//   }
// });

// frontend/styles/authStyles.js
import { StyleSheet } from 'react-native';

export const authStyles = StyleSheet.create({
  // Modifié pour un fond blanc et un padding différent
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: '#fff', 
  },
  // Modifié pour être centré et avoir plus de marge
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#1c1e21',
    textAlign: 'center',
  },
  // --- NOUVEAU --- Style pour le conteneur de chaque champ de saisie
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  // --- NOUVEAU --- Style pour les labels (Nom, Prénom, etc.)
  inputLabel: {
    fontSize: 14,
    color: '#606770',
    marginBottom: 8,
  },
  // Modifié pour un fond gris clair et une nouvelle taille
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#f5f6f7',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  // Modifié pour prendre toute la largeur
  buttonContainer: {
    marginTop: 10,
    width: '100%',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  // Modifié pour correspondre à la maquette
  linkButtonText: {
    color: '#606770',
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
  },
  // --- NOUVEAU --- Style pour le texte légal
  legalText: {
    fontSize: 12,
    color: '#606770',
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 25,
  },
  // --- NOUVEAU --- Style pour les liens dans le texte légal
  legalLink: {
    color: '#00A4A6',
    textDecorationLine: 'underline',
  },
});