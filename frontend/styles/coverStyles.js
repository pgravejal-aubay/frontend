import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const coverStyles = (theme = 'light') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors[theme].background,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    paddingBottom: 200,
  },
  loginButton: {
    backgroundColor: Colors[theme].background,
    borderWidth: 1,
    borderColor: Colors[theme].border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2.22,
    elevation: 3,
  },
  loginButtonText: {
    color: Colors[theme].text,
    fontSize: 16,
    fontWeight: '500',
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowText: {
    color: Colors[theme].icon,
    fontSize: 22,
    fontWeight: 'bold',
    marginRight: 5,
    transform: [{ translateY: -2 }],
  },
  linkText: {
    color: Colors[theme].icon,
    fontSize: 14,
  },
});
