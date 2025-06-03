import React, { useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet
} from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import members from '../assets/data/members.json';

const GroupMemberListCreatePage = () => {
  const [search, setSearch] = useState('');

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.hashtag.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => alert('Go back')}>
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.header}>Group Member</Text>
        <TouchableOpacity style={styles.confirmBtn} onPress={() => alert('Confirmed')}>
          <Text style={styles.confirmText}>Confirm</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="menu" size={20} color="#333" />
        <TextInput
          placeholder="Search Member Name or Hashtag"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        <Ionicons name="search" size={20} color="#3162F4" />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.role}>Role: {item.role}</Text>
              <Text style={styles.hashtag}>Hashtag: {item.hashtag}</Text>
            </View>
            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => alert(`Selected ${item.name}`)}
            >
              <Text style={styles.selectText}>Select</Text>
            </TouchableOpacity>
          </View>
        )}
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
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3162F4',
  },
  confirmBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { fontWeight: 'bold', fontSize: 15, color: '#fff' },
  role: { color: '#fff', fontSize: 13 },
  hashtag: { color: '#fff', fontSize: 13 },
  selectBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  selectText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default GroupMemberListCreatePage;
