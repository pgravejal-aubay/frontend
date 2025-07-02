// styles/translationStyles.ts
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const styles = (theme = 'light') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors[theme].background, // #40e0d0 (clair) ou #27b2a4 (sombre)
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
    backgroundColor: Colors[theme].buttonBackground, // #ed9bd4 pour les boutons du bas
    borderRadius: 20, // Pour un look arrondi
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMenu: {
    position: 'absolute',
    top: 95,
    left: 20,
    backgroundColor: Colors[theme].cardBackground, // #6d0d61
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
    color: Colors[theme].text, // #eb76c7
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    backgroundColor: Colors[theme].buttonBackground, // #ed9bd4 pour le bouton close
    borderRadius: 20, // Pour un look arrondi
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  translationBox: {
    flex: 1,
    backgroundColor: Colors[theme].cardBackground, // #6d0d61
    borderRadius: 20,
    padding: 20,
  },
  translationText: {
    fontSize: 24,
    color: Colors[theme].text, // #eb76c7
    lineHeight: 34,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors[theme].border, // #6d0d61
  },
  footerActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center', // Centre verticalement
    alignItems: 'center',    // Centre horizontalement
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fond semi-transparent pour assombrir l'arrière-plan
  },
  modalView: {
    margin: 20,
    backgroundColor: Colors[theme].background, // Utilise la couleur de fond du thème
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%', // Le panneau prend 90% de la largeur de l'écran
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: Colors[theme].text,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: Colors[theme].text,
  },
  textInput: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top', // Assure que le texte commence en haut pour le multiline
    color: Colors[theme].text,
    backgroundColor: Colors[theme].cardBackground, // Un fond légèrement différent
  },
  modalButtonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 2,
    flex: 1, // Pour que les boutons prennent une largeur égale
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#767577', // Couleur neutre pour annuler
  },
  submitButton: {
    backgroundColor: '#6750a4', // Couleur primaire pour envoyer
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  placeholder: Colors[theme].placeholder, // Pour la couleur du placeholder
});