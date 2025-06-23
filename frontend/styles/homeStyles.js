// frontend/styles/homeStyles.js
import { StyleSheet, Platform } from 'react-native';
 
/*
  NOTE: Les styles pour l'en-tête (header, headerRight) et pour la modale (modalView, etc.)
  ont été déplacés dans le composant `frontend/components/AppHeader.js` pour être réutilisables.
*/

export const homeStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    // Menus déroulants (avec le style corrigé)
    pickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff', // Assurer un fond blanc
    },
    pickerContainer: {
        width: '42%',
        height: 45,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        justifyContent: 'center',
    },
    picker: {
        width: '100%',
    },
    // Caméra
    cameraPreview: {
        flex: 1,
        marginHorizontal: 20,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#E0E0E0',
    },
    timerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerText: {
        color: 'white',
        fontSize: 96,
        fontWeight: 'bold',
    },
    // Contrôles
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingVertical: 30,
        backgroundColor: '#fff', // Assurer un fond blanc
    },
    sideControls: {
        gap: 20,
    },
    controlButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#F0F0F0',
    },
    recordInnerWhite: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'white',
    },
    recordInnerRed: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: 'red',
    },
    // Écran de permission
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    permissionText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
});