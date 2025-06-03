import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { auth, db } from '../../src/firestore/firebase.config';
import { doc, onSnapshot } from 'firebase/firestore';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';

const UserProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      if (auth.currentUser) {
        const userRef = doc(db, 'user', auth.currentUser.uid);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData({ id: docSnap.id, ...docSnap.data() });
          }
        });
        return () => unsubscribe();
      }
    }, [])
  );

  const handleLogout = () => {
    signOut(auth)
      .then(() => console.log("User signed out"))
      .catch((error) => {
        console.error("Sign-out error:", error);
        Alert.alert("Error", "Failed to log out. Please try again.");
      });
  };

  const navigateToEditProfile = () => {
    if (!userData) {
      Alert.alert("Error", "User data not loaded yet");
      return;
    }
    navigation.navigate('EditProfile', { user: userData });
  };

   const navigateToManageRoles = () => {
    navigation.navigate('ManageRoles');
  };


  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoTextTop}>I am</Text>
        <Text style={styles.logoTextBottom}>Available</Text>
      </View>

      <View style={styles.header}>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#007bff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToEditProfile} style={styles.profileButton}>
            <Ionicons name="person-circle-outline" size={24} color="#007bff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToManageRoles} style={styles.rolesButton}>
            <MaterialIcons name="supervisor-account" size={24} color="#007bff" />
          </TouchableOpacity>

        </View>
      </View>

      {userData ? (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
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

                <View style={styles.roleContainer}>
                  <Text style={styles.roleText}>
                    {userData.role?.charAt(0)?.toUpperCase() + userData.role?.slice(1) || "User"}
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
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  logoTextTop: {
    fontSize: 22,
    fontWeight: '300',
    color: '#333',
  },
  logoTextBottom: {
    fontSize: 28,
    fontWeight: '700',
    color: '#28a745',
    marginTop: -4,
  },
  scrollContainer: {
    flexGrow: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
  },
  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6c757d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 8,
    color: '#495057',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 11,
    color: '#28a745',
    marginLeft: 3,
  },
  pendingText: {
    fontSize: 11,
    color: '#ffc107',
    marginLeft: 3,
  },
  additionalInfo: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#6c757d',
    marginLeft: 8,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    height: 48,
    width: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    marginTop: 'auto',
    alignSelf: 'center',
  },
  logoutText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 14,
  },
});

// [styles code unchanged for brevity]
export default UserProfileScreen;
