// frontend/screens/HistoryScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
// NOUVEAU: Import pour rafraîchir les données à chaque fois que l'écran est affiché
import { useFocusEffect } from '@react-navigation/native';
import AppHeader from '../components/AppHeaders';
import { styles } from '../styles/HistoryStyle';

// NOUVEAU: Import des fonctions de chargement depuis le service
import { getHistory, getSavedTranslations } from '../services/storageService';

// Petite fonction pour mettre la première lettre en majuscule
const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const HistoryScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Historique');
  
  // NOUVEAU: États pour stocker l'historique et les éléments enregistrés
  const [historyItems, setHistoryItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);

  // NOUVEAU: Utilisation de useFocusEffect pour charger les données à chaque focus de l'écran
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        const historyData = await getHistory();
        const savedData = await getSavedTranslations();
        setHistoryItems(historyData);
        setSavedItems(savedData);
      };

      loadData();
    }, [])
  );

  const renderList = (items) => {
    if (items.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {activeTab === 'Historique' 
              ? 'Votre historique est vide.' 
              : "Aucun enregistrement pour l'instant."}
          </Text>
        </View>
      );
    }

    return items.map((item) => (
      <View key={item.id} style={styles.itemContainer}>
        <Text style={styles.languageText}>
          {capitalize(item.sourceLang)} {'->'} {capitalize(item.targetLang)}
        </Text>
        {/* Affichage du texte original et traduit */}
        <Text style={styles.originalText}>{item.originalText}</Text>
        <Text style={styles.translationText}>{item.translatedText}</Text>
      </View>
    ));
  };


  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Historique' && styles.activeTab]}
          onPress={() => setActiveTab('Historique')}
        >
          <Text style={styles.tabText}>Historique</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Enregistrés' && styles.activeTab]}
          onPress={() => setActiveTab('Enregistrés')}
        >
          <Text style={styles.tabText}>Enregistrés</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        {/* MODIFIÉ: Affichage dynamique basé sur les données chargées */}
        {activeTab === 'Historique' && renderList(historyItems)}
        {activeTab === 'Enregistrés' && renderList(savedItems)}
      </ScrollView>
    </View>
  );
};

export default HistoryScreen;