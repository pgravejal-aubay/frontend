// frontend/screens/AboutTeamScreen.js
import React, { useContext } from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import AppHeader from '../components/AppHeaders';
import { AuthContext } from '../contexts/AuthContext';
import { SettingsContext } from '../contexts/SettingsContext'
import { styles } from '../styles/AboutTeamStyle';

const teamMembers = [
  { id: 1, name: 'Nina Bourdonnec', school: 'ESIEE Paris', major: 'E-santé et biotechnologies', image: require('../assets/images/nina.jpg') },
  { id: 2, name: 'Elio Bruandet', school: 'ENSIMAG', major: '1ère année de cycle ingénieur', image: require('../assets/images/elio.jpg') },
  { id: 3, name: 'Iliana Carathanasis', school: 'ESIEE Paris', major: 'E-santé et biotechnologies', image: require('../assets/images/iliana.jpg') },
  { id: 4, name: 'Paul Gravejal', school: 'EPITA Lyon', major: 'Data Science, Intelligence artificielle et Graphes', image: require('../assets/images/juliette.jpg') },
  { id: 5, name: 'Alexandre Huynh', school: 'EPITA', major: 'Santé', image: require('../assets/images/alexandre.jpg') },
  { id: 6, name: 'Juliette Lavocat', school: 'ESIEE Paris', major: 'E-santé et biotechnologies', image: require('../assets/images/juliette.jpg') },
];

const AboutTeamScreen = () => {
  const { textSize } = useContext(AuthContext);
  const { theme, setTheme } = useContext(SettingsContext);
  return (
    <View style={styles(theme).container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles(theme).scrollContainer}>
        <Text style={[styles(theme).title, { fontSize: 28 + textSize }]}>À propos de l'équipe</Text>
        {teamMembers.map((member) => (
          <View key={member.id} style={styles(theme).profileContainer}>
            <Image source={member.image} style={styles(theme).profileImage} />
            <View style={styles(theme).profileInfo}>
              <Text style={[styles(theme).profileName, { fontSize: 18 + textSize }]}>{member.name}</Text>
              <Text style={[styles(theme).profileSchool, { fontSize: 16 + textSize }]}>{member.school}</Text>
              <Text style={[styles(theme).profileMajor, { fontSize: 14 + textSize }]}>{member.major}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default AboutTeamScreen;