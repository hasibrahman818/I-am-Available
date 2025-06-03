import React, { useState, useEffect } from 'react';
import {  View,  Text,  FlatList,  StyleSheet,  Alert,  TouchableOpacity,  Modal,  TextInput,  Switch,  ScrollView} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import currentUser from '../assets/data/currentUser.json';

const CURRENT_USER = currentUser.name;

const AvailabilityManagementPage = () => {
  const [myAvailability, setMyAvailability] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem('availabilities');
      const list = data ? JSON.parse(data) : [];
      const mine = list.filter(item => item.name === CURRENT_USER);
      setMyAvailability(mine);
    } catch (e) {
      console.error('Failed to load availabilities:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (itemId) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this availability?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const data = await AsyncStorage.getItem('availabilities');
              const list = data ? JSON.parse(data) : [];
              const updatedList = list.filter(item => item.id !== itemId);
              await AsyncStorage.setItem('availabilities', JSON.stringify(updatedList));
              const mine = updatedList.filter(item => item.name === CURRENT_USER);
              setMyAvailability(mine);
              console.log(`Deleted availability with id ${itemId}`);
            } catch (err) {
              console.error('Delete failed:', err);
            }
          }
        }
      ]
    );
  };

  const handleSaveEdit = async () => {
    try {
      const data = await AsyncStorage.getItem('availabilities');
      const list = data ? JSON.parse(data) : [];
      const updatedList = list.map(item =>
        item.id === editItem.id ? { ...editItem } : item
      );
      await AsyncStorage.setItem('availabilities', JSON.stringify(updatedList));
      const mine = updatedList.filter(item => item.name === CURRENT_USER);
      setMyAvailability(mine);
      setModalVisible(false);
      console.log('Edited:', editItem);
    } catch (err) {
      console.error('Edit failed:', err);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.date} - {item.timeStart} to {item.timeEnd}</Text>
      <Text style={styles.text}>Location: {item.location}</Text>
      <Text style={styles.text}>Group: {item.group}</Text>
      {item.recurring && <Text style={styles.recurring}>Recurring: Weekly</Text>}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => {
            setEditItem({ ...item });
            setModalVisible(true);
          }}
        >
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage My Availabilities</Text>

      <FlatList
        data={myAvailability}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => {
          alert('You will go to Create Availability Page');
          console.log('Navigate to Create Availability Page');
        }}
      >
        <Text style={styles.createBtnText}>+ Create New Availability</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Edit Availability</Text>

              <TextInput
                style={styles.input}
                placeholder="Date"
                value={editItem?.date}
                onChangeText={text => setEditItem({ ...editItem, date: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Start Time"
                value={editItem?.timeStart}
                onChangeText={text => setEditItem({ ...editItem, timeStart: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="End Time"
                value={editItem?.timeEnd}
                onChangeText={text => setEditItem({ ...editItem, timeEnd: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Location"
                value={editItem?.location}
                onChangeText={text => setEditItem({ ...editItem, location: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Group"
                value={editItem?.group}
                onChangeText={text => setEditItem({ ...editItem, group: text })}
              />
              <View style={styles.switchRow}>
                <Text style={styles.label}>Recurring Weekly:</Text>
                <Switch
                  value={editItem?.recurring}
                  onValueChange={val => setEditItem({ ...editItem, recurring: val })}
                />
              </View>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveEdit}
              >
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0eaea', padding: 20 },
  header: {
    fontSize: 20,
    backgroundColor: '#3162F4',
    color: 'white',
    textAlign: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#444',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  text: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 2,
  },
  recurring: {
    color: '#90ee90',
    fontStyle: 'italic',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editBtn: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  createBtn: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  createBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '85%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#eee',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelBtn: {
    backgroundColor: '#999',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
});

export default AvailabilityManagementPage;
