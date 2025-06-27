// frontend/screens/HistoryScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AppHeader from '../components/AppHeaders';
import { styles } from '../styles/HistoryStyle';
import { AuthContext } from '../contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useColorScheme } from '@/hooks/useColorScheme';

import { getHistory, getSavedTranslations } from '../services/storageService';

const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const HistoryScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Historique');
  const theme = useColorScheme() ?? 'light';

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
    <View style={styles(theme).container}>
      <AppHeader />
      <View style={styles(theme).tabContainer}>
        <TouchableOpacity
          style={[styles(theme).tab, activeTab === 'Historique' && styles(theme).activeTab]}
          onPress={() => setActiveTab('Historique')}
        >
          <Text style={[styles(theme).tabText, { fontSize: 16 + textSize }]}>Historique</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles(theme).tab, activeTab === 'Enregistrés' && styles(theme).activeTab]}
          onPress={() => setActiveTab('Enregistrés')}
        >
          <Text style={[styles(theme).tabText, { fontSize: 16 + textSize }]}>Enregistrés</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles(theme).content}>
        {activeTab === 'Historique' &&  renderList(historyItems) &&
          historyItems.map((item) => (
            <View key={item.id} style={styles(theme).itemContainer}>
              <Text style={[styles(theme).languageText, { fontSize: 14 + textSize }]}>Anglais {'->'} Français</Text>
              <Text style={[styles(theme).translationText, { fontSize: 18 + textSize }]}>{item.french}</Text>
            </View>
          ))}
        {activeTab === 'Enregistrés' && renderList(savedItems) &&
          savedItems.map((item) => (
            <View style={styles(theme).emptyState}>
              <Text style={[styles(theme).emptyText, { fontSize: 16 + textSize }]}>Aucun enregistrement...</Text>
            </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default HistoryScreen;
