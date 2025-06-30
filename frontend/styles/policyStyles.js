// frontend/styles/policyStyles.js
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const styles = (theme = 'light') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors[theme].background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 50,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors[theme].border || '#ccc',
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors[theme].text,
    marginLeft: 10,
  },
  scrollContent: {
    padding: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors[theme].text,
    marginBottom: 10,
  },
  metadata: {
    fontSize: 14,
    fontStyle: 'italic',
    color: Colors[theme].text,
    marginBottom: 24,
    opacity: 0.9,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors[theme].text,
    marginTop: 20,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: Colors[theme].text,
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'justify',
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: Colors[theme].text,
    marginRight: 8,
    lineHeight: 24,
  },
  listItem: {
    flex: 1,
    fontSize: 16,
    color: Colors[theme].text,
    lineHeight: 24,
    textAlign: 'justify',
  },
  definitionTerm: {
    fontWeight: 'bold',
  },
  definitionText: {
    flex: 1,
    fontSize: 16,
    color: Colors[theme].text,
    lineHeight: 24,
    textAlign: 'justify',
  },
});