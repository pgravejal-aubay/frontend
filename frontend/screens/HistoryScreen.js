// frontend/screens/HistoryScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import AppHeader from '../components/AppHeaders';
import { styles } from '../styles/HistoryStyle';
import { AuthContext } from '../contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

const HistoryScreen = ({ navigation }) => {
  const { textSize } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('Historique');
  const theme = useColorScheme() ?? 'light';

  const historyItems = [
    { id: 1, english: "I have traveled", french: "J'ai voyagé" },
    { id: 2, english: "Tomorrow it will be nice", french: "Demain il fait beau" },
    { id: 3, english: "I eat an apple", french: "Je mange une pomme" },
  ];

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
        {activeTab === 'Historique' &&
          historyItems.map((item) => (
            <View key={item.id} style={styles(theme).itemContainer}>
              <Text style={[styles(theme).languageText, { fontSize: 14 + textSize }]}>Anglais {'->'} Français</Text>
              <Text style={[styles(theme).translationText, { fontSize: 18 + textSize }]}>{item.french}</Text>
            </View>
          ))}
        {activeTab === 'Enregistrés' && (
          <View style={styles(theme).emptyState}>
            <Text style={[styles(theme).emptyText, { fontSize: 16 + textSize }]}>Aucun enregistrement...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HistoryScreen;