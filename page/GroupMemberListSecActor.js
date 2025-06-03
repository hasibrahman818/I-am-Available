import React, { useState, useEffect } from 'react';
import {  View, Text, TextInput, FlatList, TouchableOpacity,  StyleSheet} from 'react-native';
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
        <Text style={styles.text}>Role: {item.role}</Text>
        <Text style={styles.text}>Hashtag: {item.hashtag}</Text>
      </View>
      <View style={styles.btnColumn}>
        <TouchableOpacity
          style={styles.detailsBtn}
          onPress={() => alert(`Details for ${item.name}`)}
        >
          <Text style={styles.btnText}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.messageBtn}
          onPress={() => alert(`Message ${item.name}`)}
        >
          <Text style={styles.btnText}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => alert('Go back')}>
          <AntDesign name="stepbackward" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.header}>Group Member</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="menu" size={20} color="#444" />
        <TextInput
          placeholder="Search Member Name or Hashtag"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
        <Ionicons name="search" size={20} color="#444" />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e8e0dc', padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    backgroundColor: '#3a65db',
    color: 'white',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    borderRadius: 20,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#948b8b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  text: {
    color: '#eee',
    fontSize: 14,
  },
  btnColumn: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  detailsBtn: {
    backgroundColor: '#444',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  messageBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default GroupMemberListSecActor;
