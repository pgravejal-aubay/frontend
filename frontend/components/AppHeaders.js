// frontend/components/AppHeader.js

import React, { useState, useContext } from 'react';
import {AuthContext  } from "../contexts/AuthContext";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function AppHeader() {
    const navigation = useNavigation();
    const [isProfileModalVisible, setProfileModalVisible] = useState(false);
    const theme = useColorScheme() ?? 'light';

    const { signOut } = useContext(AuthContext);
    const handleLogout = async () => {
        setProfileModalVisible(false);
        await signOut();
        console.log("Déconnexion demandée");
        // Logique de déconnexion
    };

    const handleDeleteAccount = () => {
        setProfileModalVisible(false);
        // Logique de suppression
    };

    return (
        <>
            {/* La modale reste inchangée */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isProfileModalVisible}
                onRequestClose={() => setProfileModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setProfileModalVisible(false)}>
                    <View style={styles.modalBackdrop}>
                        <TouchableWithoutFeedback>
                            <View style={styles(theme).modalView}>
                                <TouchableOpacity style={styles.modalButton} onPress={handleLogout}>
                                    <Text style={styles.modalButtonText}>Déconnexion</Text>
                                </TouchableOpacity>
                                <View style={styles.modalSeparator} />
                                <TouchableOpacity style={styles.modalButton} onPress={handleDeleteAccount}>
                                    <Text style={[styles.modalButtonText, { color: 'red' }]}>Supprimer le compte</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* L'en-tête JSX mis à jour */}
            <View style={styles(theme).header}>
                {/* ===== CHANGEMENT ICI : NOUVEAU GROUPE POUR LES ICÔNES DE GAUCHE ===== */}
                <View style={styles(theme).headerLeft}>
                    <TouchableOpacity onPress={() => setProfileModalVisible(true)}>
                        <Icon name="person-outline" size={32} color={Colors[theme].text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginLeft: 16 }} onPress={() => navigation.navigate('Home')}>
                        <Icon name="home" size={32} color={Colors[theme].text} />
                    </TouchableOpacity>
                </View>
                <View style={styles(theme).headerRight}>
                    <TouchableOpacity onPress={() => navigation.navigate('History')}>
                        <Icon name="bookmark-border" size={32} color={Colors[theme].text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginLeft: 16 }} onPress={() => navigation.navigate('Settings')}>
                        <Icon name="settings" size={32} color={Colors[theme].text} />
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