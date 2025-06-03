import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  TextInput, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { auth } from '../../src/firestore/firebase.config';

const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your actual API key

const SettingsScreen = ({ navigation }) => {
  // State for settings
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    darkModeEnabled: false,
    location: null,
    locationRadius: 500, // in meters
    privacySettings: {
      profileVisible: true,
      activityVisible: true
    }
  });

  // Map states
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Load saved settings and initialize map
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        // Load saved settings
        const savedSettings = await AsyncStorage.getItem('appSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
          
          // Initialize map region with saved location or current location
          if (parsedSettings.location) {
            setRegion({
              latitude: parsedSettings.location.latitude,
              longitude: parsedSettings.location.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
            setSelectedLocation(parsedSettings.location);
          } else {
            await getCurrentLocation();
          }
        } else {
          await getCurrentLocation();
        }
      } catch (error) {
        console.error('Error initializing location:', error);
        setLocationError("Could not initialize location services");
      }
    };
    
    initializeLocation();
  }, []);

  // Get current device location
  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      
      setRegion(newRegion);
      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
    } catch (error) {
      console.error("Error getting location:", error);
      setLocationError("Could not determine your location");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Save settings when they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    };
    saveSettings();
  }, [settings]);

  // Handle map press to select new location
  const handleMapPress = async (e) => {
    const { coordinate } = e.nativeEvent;
    setSelectedLocation(coordinate);
    
    try {
      const address = await Location.reverseGeocodeAsync(coordinate);
      const addressString = [
        address[0]?.name,
        address[0]?.street,
        address[0]?.city,
        address[0]?.region,
        address[0]?.country
      ].filter(Boolean).join(', ');
      
      setSearchQuery(addressString);
    } catch (error) {
      console.error("Error getting address:", error);
    }
  };

  // Enhanced search for locations by query
  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) {
      setLocationError("Please enter an address");
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    try {
      // First try Expo's geocoding
      try {
        const locations = await Location.geocodeAsync(searchQuery);
        if (locations.length > 0) {
          const location = locations[0];
          const newRegion = {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          };
          
          setRegion(newRegion);
          setSelectedLocation({
            latitude: location.latitude,
            longitude: location.longitude,
          });
          
          // Get the full address
          const address = await Location.reverseGeocodeAsync(location);
          const addressString = [
            address[0]?.name,
            address[0]?.street,
            address[0]?.city
          ].filter(Boolean).join(', ');
          setSearchQuery(addressString);
          return;
        }
      } catch (expoGeocodeError) {
        console.log("Expo geocoding failed, falling back to Google API");
      }

      // Fallback to Google Maps API if Expo geocoding fails
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          searchQuery
        )}&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === "OK" && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        const newRegion = {
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        
        setRegion(newRegion);
        setSelectedLocation({
          latitude: location.lat,
          longitude: location.lng,
        });
        setSearchQuery(data.results[0].formatted_address);
      } else {
        setLocationError(data.error_message || "Location not found");
      }
    } catch (error) {
      console.error("Error searching location:", error);
      setLocationError("Could not connect to geocoding service");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Save the selected location
  const handleUseLocation = () => {
    if (selectedLocation) {
      setSettings(prev => ({
        ...prev,
        location: selectedLocation
      }));
      setMapModalVisible(false);
      Alert.alert("Success", "Location saved successfully");
    } else {
      Alert.alert("Error", "Please select a location first");
    }
  };

  // Adjust location radius
  const adjustLocationRadius = (increase) => {
    setSettings(prev => ({
      ...prev,
      locationRadius: Math.max(
        100, // minimum radius
        Math.min(
          5000, // maximum radius
          increase ? prev.locationRadius + 100 : prev.locationRadius - 100
        )
      )
    }));
  };

  // Toggle setting function
  const toggleSetting = (settingName, value) => {
    setSettings(prev => ({
      ...prev,
      [settingName]: value
    }));
  };

  // Toggle privacy setting function
  const togglePrivacySetting = (settingName, value) => {
    setSettings(prev => ({
      ...prev,
      privacySettings: {
        ...prev.privacySettings,
        [settingName]: value
      }
    }));
  };

  // Settings items configuration
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
          value={settings.notificationsEnabled}
          onValueChange={(value) => toggleSetting('notificationsEnabled', value)}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
        />
      ),
    },
    // {
    //   title: 'Dark Mode',
    //   icon: 'moon',
    //   rightComponent: (
    //     <Switch
    //       value={settings.darkModeEnabled}
    //       onValueChange={(value) => toggleSetting('darkModeEnabled', value)}
    //       trackColor={{ false: '#767577', true: '#81b0ff' }}
    //     />
    //   ),
    // },
    {
      title: 'Location Settings',
      icon: 'map',
      description: settings.location 
        ? `Lat: ${settings.location.latitude.toFixed(4)}, Lon: ${settings.location.longitude.toFixed(4)}\nRadius: ${settings.locationRadius}m`
        : 'Not set',
      onPress: () => setMapModalVisible(true),
    },
    {
      title: 'Privacy',
      icon: 'lock-closed',
      subItems: [
        {
          title: 'Profile Visibility',
          rightComponent: (
            <Switch
              value={settings.privacySettings.profileVisible}
              onValueChange={(value) => togglePrivacySetting('profileVisible', value)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
            />
          ),
        },
        {
          title: 'Activity Visibility',
          rightComponent: (
            <Switch
              value={settings.privacySettings.activityVisible}
              onValueChange={(value) => togglePrivacySetting('activityVisible', value)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
            />
          ),
        }
      ]
    },
    {
      title: 'Help & Support',
      icon: 'help-circle',
      onPress: () => navigation.navigate('HelpSupport'),
    },
    {
      title: 'About',
      icon: 'information-circle',
      onPress: () => navigation.navigate('About'),
    },
    {
      title: 'Logout',
      icon: 'log-out',
      color: 'red',
      onPress: () => {
        Alert.alert(
          'Logout',
          'Are you sure you want to logout?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', onPress: () => 
              signOut(auth).then(()  => {
                console.log("User signed out");
                navigation.navigate('Login');
              }).catch((error) => {
                console.error(error);
                Alert.alert("Error", "Failed to log out. Please try again.");
                })
             }
          ]
        );
      },
    },
  ];

  // Render function for settings items
  const renderSettingItem = (item, index, isSubItem = false) => (
    <TouchableOpacity
      key={index}
      style={[styles.settingItem, isSubItem && styles.subItem]}
      onPress={item.onPress}
      disabled={!item.onPress}
    >
      <View style={styles.itemLeft}>
        {!isSubItem && (
          <Ionicons 
            name={item.icon} 
            size={22} 
            color={item.color || '#007bff'} 
            style={styles.itemIcon} 
          />
        )}
        <View>
          <Text style={[styles.itemText, isSubItem && styles.subItemText]}>{item.title}</Text>
          {item.description && (
            <Text style={styles.itemDescription}>{item.description}</Text>
          )}
        </View>
      </View>
      {item.rightComponent && (
        <View style={styles.itemRight}>
          {item.rightComponent}
        </View>
      )}
      {!isSubItem && !item.rightComponent && !item.subItems && (
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      )}
    </TouchableOpacity>
  );

  // Render function for the map modal
  const renderMapModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={mapModalVisible}
      onRequestClose={() => setMapModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a location or address"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchLocation}
            returnKeyType="search"
          />
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearchLocation}
          >
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Current Location Button */}
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={getCurrentLocation}
          disabled={isLoadingLocation}
        >
          <Ionicons 
            name="locate" 
            size={20} 
            color="#007bff" 
          />
        </TouchableOpacity>

        {/* Error Message */}
        {locationError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{locationError}</Text>
          </View>
        )}

        {/* Map View */}
        {isLoadingLocation ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Loading location...</Text>
          </View>
        ) : region ? (
          <MapView
            style={styles.map}
            region={region}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={false}
            followsUserLocation={false}
          >
            {selectedLocation && (
              <>
                <Marker 
                  coordinate={selectedLocation} 
                  pinColor="#007bff"
                />
                <Circle
                  center={selectedLocation}
                  radius={settings.locationRadius}
                  fillColor="rgba(0, 123, 255, 0.2)"
                  strokeColor="rgba(0, 123, 255, 0.8)"
                  strokeWidth={2}
                />
              </>
            )}
          </MapView>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Initializing map...</Text>
          </View>
        )}

        {/* Radius Controls */}
        <View style={styles.radiusControls}>
          <TouchableOpacity 
            style={styles.radiusButton}
            onPress={() => adjustLocationRadius(false)}
            disabled={settings.locationRadius <= 100}
          >
            <Ionicons name="remove" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.radiusText}>
            Radius: {settings.locationRadius}m
          </Text>
          <TouchableOpacity 
            style={styles.radiusButton}
            onPress={() => adjustLocationRadius(true)}
            disabled={settings.locationRadius >= 5000}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
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
            disabled={!selectedLocation}
          >
            <Text style={styles.buttonText}>Save Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View >
      <ScrollView style={styles.scrollContainer}>
        
        {settingsItems.map((item, index) => (
          <View key={index}>
            {renderSettingItem(item, index)}
            {item.subItems && item.subItems.map((subItem, subIndex) => (
              renderSettingItem(subItem, subIndex, true)
            ))}
          </View>
        ))}
      </ScrollView>

      {renderMapModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  darkText: {
    color: '#ffffff',
  },
  scrollContainer: {
    padding: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
    color: '#000',
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
  subItem: {
    marginLeft: 20,
    backgroundColor: '#f9f9f9',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    marginRight: 15,
  },
  itemText: {
    fontSize: 16,
    color: '#000',
  },
  subItemText: {
    fontSize: 14,
  },
  itemDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
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
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationButton: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 50,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    marginHorizontal: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
    padding: 10,
  },
  map: {
    flex: 1,
  },
  radiusControls: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  radiusButton: {
    backgroundColor: '#007bff',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  radiusText: {
    color: '#fff',
    fontWeight: 'bold',
    minWidth: 100,
    textAlign: 'center',
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