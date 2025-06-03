import { useState, useEffect } from 'react';
import {  View, Text, TextInput, FlatList,  TouchableOpacity, Switch, StyleSheet} from 'react-native';
import { AntDesign, Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import groupData from '../assets/data/groups.json';

const GroupListPage = () => {
  const [searchText, setSearchText] = useState('');
  const [filteredGroups, setFilteredGroups] = useState(groupData);
  const [notifications, setNotifications] = useState({});

  useEffect(() => {
    const filtered = groupData.filter(group =>
      group.name.toLowerCase().includes(searchText.toLowerCase()) ||
      group.hashtag.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredGroups(filtered);
  }, [searchText]);

  const toggleNotification = (groupId) => {
    setNotifications(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
    console.log(`Notifications for ${groupId}: ${!notifications[groupId]}`);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.cardText}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.text}>Hashtag: {item.hashtag}</Text>
          <Text style={styles.text}>Description: {item.description}</Text>
          <Text style={styles.text}>Status: {item.status}</Text>
          <Text style={styles.text}>Members: {item.memberCount}</Text>
          <Text style={styles.text}>Visibility: {item.public ? 'Public' : 'Private'}</Text>
        </View>

        <View style={styles.cardActions}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>🔔</Text>
            <Switch
              value={!!notifications[item.id]}
              onValueChange={() => toggleNotification(item.id)}
            />
          </View>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              alert(`Go to Group Detail Page: ${item.name}`);
              console.log(`Detail page for ${item.id}`);
            }}
          >
            <Feather name="info" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              alert(`Go to Group Chat Page: ${item.name}`);
              console.log(`Chat page for ${item.id}`);
            }}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Group List</Text>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={20} color="#555" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search group name or hashtag"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity
          onPress={() => {
            alert('Go to Group Search Page');
            console.log('Navigate to Group Search Page');
          }}
        >
          <MaterialIcons name="travel-explore" size={22} color="#3162F4" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredGroups}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            alert('Go to Chat List Page');
            console.log('Navigate to Chat List Page');
          }}
        >
          <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
          <Text style={styles.buttonText}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#4CAF50' }]}
          onPress={() => {
            alert('Go to Group Create Page');
            console.log('Navigate to Group Create Page');
          }}
        >
          <AntDesign name="plus" size={20} color="#fff" />
          <Text style={styles.buttonText}>Add Group</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2e9f3', padding: 20 },
  header: {
    fontSize: 20,
    color: '#fff',
    backgroundColor: '#3162F4',
    textAlign: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 8,
  },
  card: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardText: {
    flex: 3,
    paddingRight: 10,
  },
  cardActions: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
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
    marginBottom: 3,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchLabel: {
    color: '#fff',
    marginRight: 4,
    fontSize: 14,
  },
  iconBtn: {
    backgroundColor: '#555',
    padding: 6,
    borderRadius: 6,
    marginTop: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3162F4',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});

export default GroupListPage;
