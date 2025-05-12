import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { auth, db } from '../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';

const HomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setUserData({ id: doc.id, ...doc.data() });
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out");
      })
      .catch((error) => {
        console.error("Sign-out error:", error);
        Alert.alert("Error", "Failed to log out. Please try again.");
      });
  };

  const navigateToEditProfile = () => {
    const staticUserData = {
      name: "Hasib Rahman",
      email: "Haisb@gmail.com",
      degree: "Computer Science",
      photoURL: null
    };
    
    navigation.navigate('EditProfile', { 
      userData: userData || staticUserData 
    });
  };

  return (
    <View style={styles.container}>
      {/* Logo at the top */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoTextTop}>I am</Text>
        <Text style={styles.logoTextBottom}>Available</Text>
      </View>

      {/* Header with welcome message and icons */}
      <View style={styles.header}>
        
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')} 
            style={styles.settingsButton}
          >
            <Ionicons name="settings-outline" size={24} color="#007bff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToEditProfile} style={styles.profileButton}>
            <Ionicons name="person-circle-outline" size={24} color="#007bff" />
          </TouchableOpacity>
        </View>
      </View>

      {userData ? (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* User Card */}
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              {userData.photoURL ? (
                <Image source={{ uri: userData.photoURL }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileIcon}>
                  <Ionicons name="person" size={40} color="#fff" />
                </View>
              )}
              
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{userData.name}</Text>
                
                {/* Role with verification badge */}
                <View style={styles.roleContainer}>
                  <Text style={styles.roleText}>
                    {userData.role?.charAt(0)?.toUpperCase() + userData.role?.slice(1)}
                  </Text>
                  
                  {userData.verified ? (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  ) : (
                    <View style={styles.pendingBadge}>
                      <Ionicons name="time" size={16} color="#ffc107" />
                      <Text style={styles.pendingText}>Pending</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Additional user info */}
            <View style={styles.additionalInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={18} color="#6c757d" />
                <Text style={styles.infoText}>{userData.email}</Text>
              </View>
              
              {userData.degree && (
                <View style={styles.infoRow}>
                  <Ionicons name="school-outline" size={18} color="#6c757d" />
                  <Text style={styles.infoText}>{userData.degree}</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.noDataContainer}>
          <Text>No user data available</Text>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  // Logo styles
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  logoTextTop: {
    fontSize: 24,
    fontWeight: '300',
    color: '#333',
  },
  logoTextBottom: {
    fontSize: 32,
    fontWeight: '700',
    color: '#28a745',
    marginTop: -5,
  },
  // Existing styles
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  headerIcons: {
    flexDirection: 'row',
  },
  settingsButton: {
    marginRight: 15,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6c757d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleText: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 10,
    color: '#495057',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    color: '#28a745',
    marginLeft: 4,
  },
  pendingText: {
    fontSize: 12,
    color: '#ffc107',
    marginLeft: 4,
  },
  additionalInfo: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 10,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    height: 50,
    width: 140,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    padding: 14,
    borderRadius: 10,
    marginTop: 'auto',
  },
  logoutText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
});

export default HomeScreen;