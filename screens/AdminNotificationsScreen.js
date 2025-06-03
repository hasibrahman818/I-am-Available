import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { db } from '../src/firestore/firebase.config';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';

const AdminNotificationsScreen = () => {
  const [pendingVerifications, setPendingVerifications] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'user'), where('verified', '==', false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = [];
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      setPendingVerifications(users);
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (userId) => {
    try {
      await updateDoc(doc(db, 'user', userId), {
        verified: true
      });
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleReject = async (userId) => {
    try {
      // You might want to handle rejection differently
      await updateDoc(doc(db, 'user', userId), {
        verified: false
      });
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Verifications</Text>
      
      {pendingVerifications.length === 0 ? (
        <Text style={styles.noPendingText}>No pending verifications</Text>
      ) : (
        <FlatList
          data={pendingVerifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
              <Text style={styles.userRole}>Role: {item.role}</Text>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.approveButton}
                  onPress={() => handleApprove(item.id)}
                >
                  <Text style={styles.buttonText}>Approve</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.rejectButton}
                  onPress={() => handleReject(item.id)}
                >
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  noPendingText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#6c757d',
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  userEmail: {
    color: '#6c757d',
    marginBottom: 5,
  },
  userRole: {
    fontStyle: 'italic',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  approveButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AdminNotificationsScreen;