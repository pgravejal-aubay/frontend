// frontend/screens/HistoryScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import AppHeader from '../components/AppHeaders';
import { styles } from '../styles/HistoryStyle';
import { AuthContext } from '../contexts/AuthContext';

const HistoryScreen = ({ navigation }) => {
  const { textSize } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('Historique');

  const historyItems = [
    { id: 1, english: "I have traveled", french: "J'ai voyagé" },
    { id: 2, english: "Tomorrow it will be nice", french: "Demain il fait beau" },
    { id: 3, english: "I eat an apple", french: "Je mange une pomme" },
  ];

  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Historique' && styles.activeTab]}
          onPress={() => setActiveTab('Historique')}
        >
          <Text style={[styles.tabText, { fontSize: 16 + textSize }]}>Historique</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Enregistrés' && styles.activeTab]}
          onPress={() => setActiveTab('Enregistrés')}
        >
          <Text style={[styles.tabText, { fontSize: 16 + textSize }]}>Enregistrés</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        {activeTab === 'Historique' &&
          historyItems.map((item) => (
            <View key={item.id} style={styles.itemContainer}>
              <Text style={[styles.languageText, { fontSize: 14 + textSize }]}>Anglais {'->'} Français</Text>
              <Text style={[styles.translationText, { fontSize: 18 + textSize }]}>{item.french}</Text>
            </View>
          ))}
        {activeTab === 'Enregistrés' && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { fontSize: 16 + textSize }]}>Aucun enregistrement...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HistoryScreen;


