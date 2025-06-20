// frontend/styles/authStyles.js
import { StyleSheet } from 'react-native';

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: '#fff', 
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#1c1e21',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#606770',
    marginBottom: 8,
  },
  // Style pour les champs SIMPLES (Nom, Prénom, Email)
  input: {
    height: 48,
    backgroundColor: '#f5f6f7',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  // Style pour la "boîte" qui contient le champ de mot de passe ET l'icône
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#f5f6f7',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  // Style pour le champ de texte À L'INTÉRIEUR du passwordWrapper
  inputInWrapper: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#000',
  },
  eyeIcon: {
    // Ce style peut rester vide, il sert juste de cible
  },
  registerButton: {
    backgroundColor: '#1c1e21',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  linkButtonText: {
    color: '#606770',
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
  },
  
  // --- STYLES POUR LE TEXTE LÉGAL ---

  // Le conteneur principal pour la section légale
  legalSectionContainer: {
    alignItems: 'center', // Centre les lignes horizontalement
    marginTop: 10,
    marginBottom: 25,
  },
  // Style pour chaque ligne (ex: "et notre" + "Politique...")
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Style pour le texte non-cliquable
  legalText: {
    fontSize: 12,
    color: '#606770',
    lineHeight: 18,
  },
  // Style pour les liens cliquables
  legalLink: {
    fontSize: 12, // Même taille de police pour un alignement parfait
    color: '#00A4A6',
    textDecorationLine: 'underline',
    lineHeight: 18,
  },
});