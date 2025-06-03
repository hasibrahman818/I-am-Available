import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HelpSupportScreen = () => {
  const handleEmailPress = () => {
    Linking.openURL('mailto:support@ipb.pt');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="help-circle-outline" size={50} color="#28a745" style={styles.icon} />
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.content}>
          Need help using the app?
        </Text>

        <Text style={styles.subText}>
          Contact our support team or talk to your professor for guidance.
        </Text>

        <TouchableOpacity onPress={handleEmailPress} style={styles.emailButton}>
          <Ionicons name="mail" size={20} color="#fff" />
          <Text style={styles.emailText}> support@ipb.pt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9f5ec',
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
    color: '#28a745',
    marginBottom: 10,
  },
  content: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  emailText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },
});

export default HelpSupportScreen;
