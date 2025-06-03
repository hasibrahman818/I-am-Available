import React, { useState } from 'react';
import {  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import memberData from '../assets/data/members.json'; 

const GroupMemberListMainActor = () => {
  const [searchText, setSearchText] = useState('');
  const [members, setMembers] = useState(memberData);

  const filtered = members.filter(member =>
    member.name.toLowerCase().includes(searchText.toLowerCase()) ||
    member.hashtag.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.role}>Role: {item.role}</Text>
      <Text style={styles.hashtag}>Hashtag: {item.hashtag}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.detailsBtn}
          onPress={() => alert(`View details of ${item.name}`)}
        >
          <Text style={styles.detailsText}>Details</Text>
        </TouchableOpacity>

        {item.role !== 'Group Owner' && (
          <>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => alert(`Edit ${item.name}`)}
            >
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => alert(`Delete ${item.name}`)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <AntDesign name="arrowleft" size={24} color="#333" />
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
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <View style={styles.footerBtn}>
        <TouchableOpacity
          style={styles.reqBtn}
          onPress={() => alert('Go to Request Management Page')}
        >
          <Text style={styles.footerText}>Request Management</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.inviteBtn}
          onPress={() => alert('Go to Invite Member Page')}
        >
          <Text style={styles.footerText}>Invite Member</Text>
        </TouchableOpacity>
      </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  name: { fontWeight: 'bold', fontSize: 15, color: '#fff' },
  role: { color: '#fff', fontSize: 13 },
  hashtag: { color: '#fff', fontSize: 13 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
  },
  detailsBtn: {
    backgroundColor: '#444',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  detailsText: { color: '#fff', fontWeight: 'bold' },
  editBtn: {
    backgroundColor: '#90ee90',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  editText: { color: '#333', fontWeight: 'bold' },
  deleteBtn: {
    backgroundColor: '#e53935',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  deleteText: { color: '#fff', fontWeight: 'bold' },
  footerBtn: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  reqBtn: {
    backgroundColor: '#3162F4',
    width: '100%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  inviteBtn: {
    backgroundColor: '#4CAF50',
    width: '100%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  footerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default GroupMemberListMainActor;
