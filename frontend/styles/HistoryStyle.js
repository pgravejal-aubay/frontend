// frontend/styles/HistoryStyle.js
import { StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';

export const styles = (theme = 'light') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors[theme].background, // #40e0d0 (clair) ou #27b2a4 (sombre)
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: Colors[theme].cardBackground, // #6d0d61
    borderBottomWidth: 1,
    borderBottomColor: Colors[theme].border, // #6d0d61
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },
  activeTab: {
    backgroundColor: Colors[theme].buttonBackground, // #6d0d61
  },
  tabText: {
    fontSize: 16,
    color: Colors[theme].text, // #eb76c7
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 10,
  },
  itemContainer: {
    backgroundColor: Colors[theme].cardBackground, // #6d0d61
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  languageText: {
    fontSize: 14,
    color: Colors[theme].text, // #eb76c7
  },
  originalText: {
    fontSize: 16,
    color: Colors[theme].text, // #6d0d61 (violet)
    marginBottom: 5,
  },
  translationText: {
    fontSize: 18,
    color: Colors[theme].text, // #eb76c7
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors[theme].text, // #eb76c7
  },
});