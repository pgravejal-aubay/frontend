// styles/coverStyles.js

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    paddingBottom: 200, 
  },
  loginButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // --- MODIFICATION ICI ---
  arrowText: {
    color: '#666',
    fontSize: 22, // Encore plus grosse ! (de 18 à 22)
    fontWeight: 'bold',
    marginRight: 5,
    // On ajuste la correction verticale car la flèche est plus grande
    transform: [{ translateY: -2 }], 
  },
  linkText: {
    color: '#666',
    fontSize: 14,
  },
});