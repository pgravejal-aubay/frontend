// frontend/styles/AboutTeamStyle.js
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const styles = (theme = 'light') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors[theme].background, // #40e0d0
    padding: 16,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    color: Colors[theme].text, // #6d0d61
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors[theme].cardBackground, // #ed9bd4
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40, // Rond
    marginRight: 15,
    overflow: 'hidden', // Rognage circulaire
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: Colors[theme].text, // #6d0d61
    fontWeight: 'bold',
  },
  profileSchool: {
    color: Colors[theme].text, // #6d0d61
    marginTop: 5,
  },
  profileMajor: {
    color: Colors[theme].text, // #6d0d61
    marginTop: 5,
  },
});