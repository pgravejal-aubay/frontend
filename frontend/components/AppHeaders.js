// frontend/components/AppHeader.js
import React, { useState, useContext } from 'react';
import {AuthContext  } from "../contexts/AuthContext";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform,Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { supression,isLoggedIn } from '../services/authService'
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { SettingsContext } from '../contexts/SettingsContext';




export default function AppHeader() {
    const navigation = useNavigation();
    const [isProfileModalVisible, setProfileModalVisible] = useState(false);
    const {
        voice, setVoice,
        speechRate, setSpeechRate,
        availableVoices,
        theme, setTheme
      } = useContext(SettingsContext);
    
      const currentTheme = theme ?? useColorScheme();
      const themedStyles = styles(currentTheme);

    const { signOut } = useContext(AuthContext);
    const handleLogout = async () => {
        const logged = await isLoggedIn();
        if (!logged){
            showLoginAlert();
            return;
        }
        setProfileModalVisible(false);
        await signOut();
        console.log("Déconnexion demandée");
        // Logique de déconnexion
    };

    const handleDeleteAccount = async () => {
        const logged = await isLoggedIn();
        if (!logged){
            showLoginAlert();
            return;
        }
        setProfileModalVisible(false);
        await supression();
        await signOut();
        console.log("Suppresion demandée");
        // Logique de suppression
    };

    const goHistory = async () => {
        const logged = await isLoggedIn();
        if (!logged){
            showLoginAlert();
            return;
        }
        navigation.navigate('History')
    }

    const goSettings = async () => {
        const logged = await isLoggedIn();
        if (!logged){
            showLoginAlert();
            return;
        }
        navigation.navigate('Settings')
    }

    const showLoginAlert = () => {
    Alert.alert(
        'Connexion requise',
        'Veuillez vous connecter pour continuer',
        [
        {
            text: 'Annuler',
            style: 'cancel',
        },
        {
            text: 'Se connecter',
            onPress: () => navigation.navigate('Login'),
        },
        ],
        { cancelable: true }
    );
    };

    return (
        <>
            {/* La modale reste inchangée */}
            <Modal animationType="fade" transparent={true} visible={isProfileModalVisible} onRequestClose={() => setProfileModalVisible(false)}>
                <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setProfileModalVisible(false)}>
                    <View style={themedStyles.modalView}>
                        <TouchableOpacity style={styles.modalButton} onPress={handleLogout}><Text style={styles.modalButtonText}>Déconnexion</Text></TouchableOpacity>
                        <View style={styles.modalSeparator} />
                        <TouchableOpacity style={styles.modalButton} onPress={handleDeleteAccount}><Text style={[styles.modalButtonText, { color: 'red' }]}>Supprimer le compte</Text></TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* L'en-tête JSX mis à jour */}
            <View style={themedStyles.header}>
                {/* ===== CHANGEMENT ICI : NOUVEAU GROUPE POUR LES ICÔNES DE GAUCHE ===== */}
                <View style={themedStyles.headerLeft}>
                    <TouchableOpacity onPress={() => setProfileModalVisible(true)}>
                        <Icon name="person-outline" size={32} color={Colors[currentTheme].text} /> 
                    </TouchableOpacity>

                    {/* ===== AJOUT DU BOUTON HOME ===== */}
                    <TouchableOpacity style={{ marginLeft: 16 }} onPress={() => navigation.navigate('Home')}>
                        {/* L'icône pour la maison dans MaterialIcons est "home" ou "home-outline" */}
                        <Icon name="home" size={32} color={Colors[currentTheme].text} />
                    </TouchableOpacity>
                </View>

                {/* La partie droite de l'en-tête reste inchangée */}
                <View style={themedStyles.headerRight}>
                    <TouchableOpacity onPress={goHistory}>
                        <Icon name="bookmark-border" size={32} color={Colors[currentTheme].text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginLeft: 16 }} onPress={goSettings}>
                        <Icon name="settings" size={32} color={Colors[currentTheme].text} />
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}

// Les styles mis à jour
const styles = (theme = 'light') => StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 50 : 60,
        paddingBottom: 10,
        backgroundColor: Colors[theme].background,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    modalView: {
        marginTop: Platform.OS === 'android' ? 90 : 100,
        marginLeft: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10,
        width: 200,
        elevation: 5,
    },
    modalButton: { paddingVertical: 12, paddingHorizontal: 10 },
    modalButtonText: { fontSize: 16 },
    modalSeparator: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 4 },
});

