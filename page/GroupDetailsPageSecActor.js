import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet
} from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import members from '../assets/data/members.json';

const GroupMemberListSecActor = () => {
  const [searchText, setSearchText] = useState('');
  const [filtered, setFiltered] = useState(members);

  useEffect(() => {
    const lower = searchText.toLowerCase();
    const result = members.filter(
      m => m.name.toLowerCase().includes(lower) || m.hashtag.toLowerCase().includes(lower)
    );
    setFiltered(result);
  }, [searchText]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.role}>Role: {item.role}</Text>
        <Text style={styles.hashtag}>Hashtag: {item.hashtag}</Text>
      </View>
      <View style={styles.buttonColumn}>
        <TouchableOpacity
          style={styles.detailsBtn}
          onPress={() => alert(`Details for ${item.name}`)}
        >
          <Text style={styles.detailsText}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.messageBtn}
          onPress={() => alert(`Message ${item.name}`)}
        >
          <Text style={styles.messageText}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => alert('Go back')}>
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.header}>Group Member</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="menu" size={20} color="#333" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Member Name or Hashtag"
          value={searchText}
          onChangeText={setSearchText}
        />
        <Ionicons name="search" size={20} color="#3162F4" />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e9e4e4', padding: 20 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#3162F4',
  },
  searchBar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 10,
  },
  card: {
    backgroundColor: '#9f9595',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  name: { fontWeight: 'bold', fontSize: 15, color: '#fff' },
  role: { color: '#fff', fontSize: 13 },
  hashtag: { color: '#fff', fontSize: 13 },
  buttonColumn: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  detailsBtn: {
    backgroundColor: '#444',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  messageBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  detailsText: { color: '#fff', fontWeight: 'bold' },
  messageText: { color: '#fff', fontWeight: 'bold' },
});

export default GroupMemberListSecActor;
