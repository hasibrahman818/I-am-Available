import React, { useState, useEffect } from 'react';
import {  View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import requests from '../assets/data/joinRequest.json';

const RequestManagementPage = () => {
  const [searchText, setSearchText] = useState('');
  const [filteredRequests, setFilteredRequests] = useState(requests);

  useEffect(() => {
    const filtered = requests.filter(item =>
      item.user.toLowerCase().includes(searchText.toLowerCase()) ||
      item.group.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredRequests(filtered);
  }, [searchText]);

  const handleDecision = (id, decision) => {
    const action = decision === 'accept' ? 'Accepted' : 'Rejected';
    alert(`${action} Request`, `You have ${action.toLowerCase()} the request.`);
    console.log(`${action} request with id ${id}`);
    setFilteredRequests(prev => prev.filter(item => item.id !== id));
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.user}</Text>
      <Text style={styles.text}>Group: {item.group}</Text>
      {item.reason ? <Text style={styles.text}>Reason: {item.reason}</Text> : null}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={() => handleDecision(item.id, 'accept')}
        >
          <Text style={styles.btnText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => handleDecision(item.id, 'reject')}
        >
          <Text style={styles.btnText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            alert('Go back');
            console.log('Back to previous page');
          }}
        >
          <AntDesign name="stepbackward" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Join Requests</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by user or group"
        value={searchText}
        onChangeText={setSearchText}
      />

      <FlatList
        data={filteredRequests}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2e9f3', padding: 20 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3162F4',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  acceptBtn: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  rejectBtn: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default RequestManagementPage;
