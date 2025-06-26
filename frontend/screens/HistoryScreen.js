// frontend/screens/HistoryScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AppHeader from '../components/AppHeaders';
import { styles } from '../styles/HistoryStyle';

import { getHistory, getSavedTranslations } from '../services/storageService';

const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const HistoryScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Historique');
  
  const [historyItems, setHistoryItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);

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
        {activeTab === 'Historique' && renderList(historyItems)}
        {activeTab === 'Enregistrés' && renderList(savedItems)}
      </ScrollView>
    </View>
  );
};

export default HistoryScreen;
