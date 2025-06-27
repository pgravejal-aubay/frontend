import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const authStyles = (theme = 'light') => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors[theme].background,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  scrollableContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: Colors[theme].cardBackground,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors[theme].text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitleContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: Colors[theme].icon,
  },
  subtitleLink: {
    fontWeight: 'bold',
    color: Colors[theme].text,
  },

  label: {
    fontSize: 14,
    color: Colors[theme].text,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors[theme].background,
    borderWidth: 1,
    borderColor: Colors[theme].border,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    color: Colors[theme].text,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors[theme].background,
    borderWidth: 1,
    borderColor: Colors[theme].border,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors[theme].text,
  },

  primaryButton: {
    backgroundColor: Colors[theme].text,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    color: Colors[theme].background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryLink: {
    fontSize: 14,
    color: Colors[theme].icon,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },

  errorText: {
    color: Colors.dark.error ?? '#D93025',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
});
