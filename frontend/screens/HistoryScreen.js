// frontend/screens/HistoryScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import AppHeader from '../components/AppHeaders';
import { styles } from '../styles/HistoryStyle';

const HistoryScreen = ({ navigation }) => {
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
        {activeTab === 'Historique' &&
          historyItems.map((item) => (
            <View key={item.id} style={styles.itemContainer}>
              <Text style={styles.languageText}>Anglais {'->'} Français</Text>
              <Text style={styles.translationText}>{item.french}</Text>
            </View>
          ))}
        {activeTab === 'Enregistrés' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucun enregistrement pour l'instant.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HistoryScreen;