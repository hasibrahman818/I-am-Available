import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Modal, TextInput, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const SettingsScreen = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedLocation, setSelectedLocation] = useState(null);

  const settingsItems = [
    {
      title: 'Account',
      icon: 'person',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      title: 'Notifications',
      icon: 'notifications',
      rightComponent: (
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
        />
      ),
    },
    {
      title: 'Dark Mode',
      icon: 'moon',
      rightComponent: (
        <Switch
          value={darkModeEnabled}
          onValueChange={setDarkModeEnabled}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
        />
      ),
    },
    {
      title: 'Location Settings',
      icon: 'map',
      onPress: () => setMapModalVisible(true),
    },
    {
      title: 'Privacy',
      icon: 'lock-closed',
      onPress: () => console.log('Privacy pressed'),
    },
    {
      title: 'Help & Support',
      icon: 'help-circle',
      onPress: () => console.log('Help pressed'),
    },
    {
      title: 'About',
      icon: 'information-circle',
      onPress: () => console.log('About pressed'),
    },
    {
      title: 'Logout',
      icon: 'log-out',
      color: 'red',
      onPress: () => navigation.navigate('Login'),
    },
  ];

  const handleMapPress = async (e) => {
    const { coordinate } = e.nativeEvent;
    setSelectedLocation(coordinate);
    
    // Reverse geocode to get address
    try {
      const address = await Location.reverseGeocodeAsync(coordinate);
      setSearchQuery(`${address[0]?.name || ''} ${address[0]?.street || ''}, ${address[0]?.city || ''}`);
    } catch (error) {
      console.error("Error getting address:", error);
    }
  };

  const handleSearchLocation = async () => {
    try {
      const locations = await Location.geocodeAsync(searchQuery);
      if (locations.length > 0) {
        const location = locations[0];
        setRegion({
          ...region,
          latitude: location.latitude,
          longitude: location.longitude,
        });
        setSelectedLocation({
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }
    } catch (error) {
      console.error("Error searching location:", error);
      Alert.alert("Error", "Could not find the location");
    }
  };

  const handleUseLocation = () => {
    if (selectedLocation) {
      // Here you would typically save the location to your app state or backend
      console.log("Selected location:", selectedLocation);
      Alert.alert("Success", "Location saved successfully");
      setMapModalVisible(false);
    } else {
      Alert.alert("Error", "Please select a location first");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.header}>Settings</Text>
        
        {settingsItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.settingItem}
            onPress={item.onPress}
            disabled={!item.onPress}
          >
            <View style={styles.itemLeft}>
              <Ionicons 
                name={item.icon} 
                size={22} 
                color={item.color || '#007bff'} 
                style={styles.itemIcon} 
              />
              <Text style={styles.itemText}>{item.title}</Text>
            </View>
            {item.rightComponent && (
              <View style={styles.itemRight}>
                {item.rightComponent}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Location Search Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={mapModalVisible}
        onRequestClose={() => setMapModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a location"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchLocation}
            />
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={handleSearchLocation}
            >
              <Ionicons name="search" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <MapView
            style={styles.map}
            region={region}
            onPress={handleMapPress}
          >
            {selectedLocation && (
              <Marker coordinate={selectedLocation} />
            )}
          </MapView>

          <View style={styles.mapButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setMapModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handleUseLocation}
            >
              <Text style={styles.buttonText}>Use This Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: 15,
  },
  itemText: {
    fontSize: 16,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Map modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  mapButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SettingsScreen;