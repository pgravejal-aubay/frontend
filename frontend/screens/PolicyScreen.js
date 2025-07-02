// frontend/screens/PolicyScreen.js
import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import { styles as policyStyles } from '../styles/policyStyles';
import { SettingsContext } from '../contexts/SettingsContext';


const ContentRenderer = ({ item, styles, textSize }) => {
  switch (item.type) {
    case 'metadata':
      return <Text style={[styles.metadata, { fontSize: 14 + (textSize / 2) }]}>{item.text}</Text>;
    
    case 'subtitle':
      return <Text style={[styles.subtitle, { fontSize: 22 + textSize }]}>{item.text}</Text>;
    
    case 'rich_text':
      return (
        <Text style={[styles.paragraph, { fontSize: 16 + textSize, lineHeight: 24 + (textSize / 2) }]}>
          {item.content.map((chunk, index) => (
            <Text key={index} style={chunk.style === 'bold' ? styles.definitionTerm : null}>
              {chunk.text}
            </Text>
          ))}
        </Text>
      );

    case 'list_item':
      return (
        <View style={styles.listContainer}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={[styles.listItem, { fontSize: 16 + textSize, lineHeight: 24 + (textSize / 2) }]}>{item.text}</Text>
        </View>
      );
    
    case 'definition_item':
      return (
        <View style={styles.listContainer}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={[styles.definitionText, { fontSize: 16 + textSize, lineHeight: 24 + (textSize / 2) }]}>
            <Text style={styles.definitionTerm}>{item.term}</Text>
            <Text> : {item.definition}</Text>
          </Text>
        </View>
      );
      
    case 'paragraph':
    default:
      return <Text style={[styles.paragraph, { fontSize: 16 + textSize, lineHeight: 24 + (textSize / 2) }]}>{item.text}</Text>;
  }
};

const PolicyScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, setTheme } = useContext(SettingsContext);
  const styles = policyStyles(theme);
  const { title, content } = route.params;
  const { textSize } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={theme === 'dark' ? '#FFF' : '#000'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.mainTitle, { fontSize: 32 + textSize }]}>{title}</Text>
        {content.map((item, index) => (
          <ContentRenderer key={index} item={item} styles={styles} textSize={textSize} />
        ))}
      </ScrollView>
    </View>
  );
};

export default PolicyScreen;