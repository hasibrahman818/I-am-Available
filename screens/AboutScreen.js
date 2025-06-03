import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AboutScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="information-circle-outline" size={50} color="#007bff" style={styles.icon} />
        <Text style={styles.title}>About This App</Text>
        <Text style={styles.content}>
          Version 1.0.0
          {'\n\n'}
          Developed with 💙 by Hasib, Beatrix & Xiaoyi.
          {'\n\n'}
          This app allows users to manage their personal settings, privacy preferences, and geolocation data to enhance their user experience.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
  },
  content: {
    fontSize: 16,
    textAlign: 'center',
    color: '#444',
    lineHeight: 24,
  },
});

export default AboutScreen;
