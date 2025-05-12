import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ManageRolesScreen = () => {
  const [searchText, setSearchText] = useState('');
  
  // Demo data matching your screenshot
  const demoUsers = [
    {
      id: '1',
      name: 'Student AAA',
      role: 'Student',
      hashtag: '#StudAAA'
    },
    {
      id: '2',
      name: 'Tutor BBB',
      role: 'Tutor',
      hashtag: '#TutorBBB'
    },
    {
      id: '3',
      name: 'Professor CCC',
      role: 'Professor',
      hashtag: '#ProfCCC'
    }
  ];

  // Filter users based on search text
  const filteredUsers = demoUsers.filter(user => 
    user.name.toLowerCase().includes(searchText.toLowerCase()) ||
    user.role.toLowerCase().includes(searchText.toLowerCase()) ||
    user.hashtag.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderUserCard = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userRole}>Role: {item.role}</Text>
        <Text style={styles.userHashtag}>{item.hashtag}</Text>
      </View>
      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or role..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* User List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  userRole: {
    color: '#6c757d',
    marginBottom: 5,
  },
  userHashtag: {
    color: '#28a745',
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default ManageRolesScreen;