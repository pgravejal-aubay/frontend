import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const styles = (theme = 'light') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors[theme].background,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: Colors[theme].cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors[theme].border,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: Colors[theme].buttonBackground,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors[theme].text,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  itemContainer: {
    backgroundColor: Colors[theme].cardBackground,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  languageText: {
    fontSize: 14,
    color: Colors[theme].icon,
  },
  translationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors[theme].text,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors[theme].icon,
  },
});
