import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity,} from 'react-native';
import { MaterialCommunityIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import dashboardRaw from '../assets/data/dashboardData.json';
import availabilityRaw from '../assets/data/availability.json';

const DashboardScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const getStatus = (name) => {
    const now = new Date();
    const userAvail = availabilityRaw.filter(a => a.name === name);

    for (const a of userAvail) {
      const start = new Date(`${a.date}T${a.timeStart}`);
      const end = new Date(`${a.date}T${a.timeEnd}`);
      const diffMinutes = (start - now) / 60000;

      if (now >= start && now <= end) {
        return { status: 'Available', color: 'green' };
      } else if (diffMinutes > 0 && diffMinutes <= 15) {
        return { status: 'Busy', color: 'orange' };
      }
    }
    return { status: 'Not Available', color: 'red' };
  };

  useEffect(() => {
    const enriched = dashboardRaw.map(user => {
      const { status, color } = getStatus(user.name);
      return { ...user, status, color };
    });

    const filtered = enriched.filter(item =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.hashtag?.toLowerCase().includes(searchText.toLowerCase())
    );

    setFilteredData(filtered);
  }, [searchText]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.location}>{item.location}</Text>
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: item.color }]} />
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>

      <View style={styles.searchBar}>
        <Ionicons name="menu" size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Name or Hashtag"
          value={searchText}
          onChangeText={setSearchText}
        />
        <Ionicons name="search" size={20} />
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <View style={styles.floatingButtons}>
      <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            alert('You will go to Map Page.');
            console.log('go to map page');
          }}
      >
      <MaterialCommunityIcons name="map" size={24} />
      </TouchableOpacity>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            alert('You are already on Home page');
            console.log('Go to Home');
          }}
        >
          <AntDesign name="home" size={20} color="#6a42ff" />
          <Text style={styles.activeTab}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            alert('You will go to Group page');
            console.log('Go to Group');
          }}
        >
          <AntDesign name="team" size={20} color="#000" />
          <Text>Group</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            alert('You will go to Profile page');
            console.log('Go to Profile');
          }}
        >
          <AntDesign name="user" size={20} color="#000" />
          <Text>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            alert('You will go to Availability page');
            console.log('Go to Availability');
          }}
        >
          <AntDesign name="calendar" size={20} color="#000" />
          <Text>Availability</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e3d6d6', padding: 20 },
  header: {
    fontSize: 20,
    backgroundColor: '#3162F4',
    color: 'white',
    textAlign: 'center',
    padding: 10,
    borderRadius: 15,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2e9f3',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  location: {
    color: '#ccc',
    fontSize: 14,
    marginVertical: 5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
  },
  floatingButtons: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    flexDirection: 'row',
    gap: 15,
  },
  iconButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 25,
    elevation: 3,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#f9f2f4',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopColor: '#ccc',
    borderTopWidth: 1,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },  
  activeTab: {
    color: '#6a42ff',
    fontWeight: 'bold',
  }
});

export default DashboardScreen;
