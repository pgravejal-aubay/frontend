// frontend/screens/HistoryScreen.js
import React, { useState,useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AppHeader from '../components/AppHeaders';
import { styles } from '../styles/HistoryStyle';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SettingsContext } from '../contexts/SettingsContext';

import { getHistory, getSavedTranslations } from '../services/storageService';

const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const HistoryScreen = ({ navigation }) => {
  const {
          voice, setVoice,
          speechRate, setSpeechRate,
          availableVoices,
          theme, setTheme
        } = useContext(SettingsContext);
      
  const currentTheme = theme ?? useColorScheme();
  const themedStyles = styles(currentTheme);
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
        <View style={themedStyles.emptyState}>
          <Text style={themedStyles.emptyText}>
            {activeTab === 'Historique' 
              ? 'Votre historique est vide.' 
              : "Aucun enregistrement pour l'instant."}
          </Text>
        </View>
      );
    }

    return items.map((item) => (
      <View key={item.id} style={themedStyles.itemContainer}>
        <Text style={themedStyles.languageText}>
          {capitalize(item.sourceLang)} {'->'} {capitalize(item.targetLang)}
        </Text>
        <Text style={themedStyles.originalText}>{item.originalText}</Text>
        <Text style={themedStyles.translationText}>{item.translatedText}</Text>
      </View>
    ));
  };


  return (
    <View style={themedStyles.container}>
      <AppHeader />
      <View style={themedStyles.tabContainer}>
        <TouchableOpacity
          style={[themedStyles.tab, activeTab === 'Historique' && themedStyles.activeTab]}
          onPress={() => setActiveTab('Historique')}
        >
          <Text style={themedStyles.tabText}>Historique</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[themedStyles.tab, activeTab === 'Enregistrés' && themedStyles.activeTab]}
          onPress={() => setActiveTab('Enregistrés')}
        >
          <Text style={themedStyles.tabText}>Enregistrés</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={themedStyles.content}>
        {activeTab === 'Historique' && renderList(historyItems)}
        {activeTab === 'Enregistrés' && renderList(savedItems)}
      </ScrollView>
    </View>
  );
};

export default HistoryScreen;
