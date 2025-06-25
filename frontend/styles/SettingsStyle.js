// frontend/styles/SettingsStyle.js
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const styles = (theme = 'light') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors[theme].background, // #40e0d0 (clair) ou #27b2a4 (sombre)
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  userMenu: {
    position: 'absolute',
    top: 95,
    left: 20,
    backgroundColor: Colors[theme].cardBackground, // #6d0d61
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors[theme].text, // #eb76c7
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 28,
    color: Colors[theme].text, // #eb76c7
    fontWeight: '700',
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  preferenceLabel: {
    fontSize: 22,
    color: Colors[theme].text, // #eb76c7
  },
  sizeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors[theme].cardBackground, // #6d0d61
    borderRadius: 8,
    padding: 4,
  },
  sizeButton: {
    padding: 0,
  },
  separator: {
    width: 1,
    height: 12,
    backgroundColor: Colors[theme].border, // #6d0d61
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: Colors[theme].border, // #6d0d61
    borderRadius: 4,
    width: 168,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  policyButton: {
    height: 48,
    minWidth: 250,
    borderRadius: 8,
    borderColor: Colors[theme].border, // #6d0d61
    backgroundColor: Colors[theme].buttonBackground, // #6d0d61
    shadowColor: '#00000040',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    marginBottom: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  policyText: {
    fontSize: 14,
    color: Colors[theme].text, // #eb76c7
    textAlign: 'center',
  },
  logoutButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  icon: {
    width: 16,
    height: 16,
  },
});