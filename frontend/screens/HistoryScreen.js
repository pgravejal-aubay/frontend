// frontend/screens/HistoryScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AppHeader from '../components/AppHeaders';
import { styles } from '../styles/HistoryStyle';
import { AuthContext } from '../contexts/AuthContext';
import { SettingsContext } from '../contexts/SettingsContext';

import { getHistory, getSavedTranslations } from '../services/storageService';

const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const HistoryScreen = ({ navigation }) => {
  const { textSize } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('Historique');
  const { theme, setTheme } = useContext(SettingsContext);

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
        <View style={styles(theme).emptyState}>
          <Text style={styles(theme).emptyText}>
            {activeTab === 'Historique' 
              ? 'Votre historique est vide.' 
              : "Aucun enregistrement pour l'instant."}
          </Text>
        </View>
      );
    }

    return items.map((item) => (
      <View key={item.id} style={styles(theme).itemContainer}>
        <Text style={styles(theme).languageText}>
          {capitalize(item.sourceLang)} {'->'} {capitalize(item.targetLang)}
        </Text>
        <Text style={styles(theme).originalText}>{item.originalText}</Text>
        <Text style={styles(theme).translationText}>{item.translatedText}</Text>
      </View>
    ));
  };


  return (
    <View style={styles(theme).container}>
      <AppHeader />
      <View style={styles(theme).tabContainer}>
        <TouchableOpacity
          style={[styles(theme).tab, activeTab === 'Historique' && styles(theme).activeTab]}
          onPress={() => setActiveTab('Historique')}
        >
          <Text style={styles(theme).tabText}>Historique</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles(theme).tab, activeTab === 'Enregistrés' && styles(theme).activeTab]}
          onPress={() => setActiveTab('Enregistrés')}
        >
          <Text style={styles(theme).tabText}>Enregistrés</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles(theme).content}>
        {activeTab === 'Historique' && renderList(historyItems)}
        {activeTab === 'Enregistrés' && renderList(savedItems)}
      </ScrollView>
    </View>
  );
};

export default HistoryScreen;