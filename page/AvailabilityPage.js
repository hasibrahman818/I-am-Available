import React, { useState, useEffect } from 'react';
import {View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Modal, ScrollView} from 'react-native';
import availabilityData from '../assets/data/availability.json';
import { Ionicons } from '@expo/vector-icons';


const AvailabilityPage = () => {
    const [searchText, setSearchText] = useState('');
    const [filteredData, setFilteredData] = useState(availabilityData);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
  
    useEffect(() => {
      const filtered = availabilityData.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.group.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredData(filtered);
    }, [searchText]);
  
    const renderItem = ({ item }) => (
      <View style={styles.card}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.text}>Date: {item.date}</Text>
        <Text style={styles.text}>Time: {item.timeStart} - {item.timeEnd}</Text>
        <Text style={styles.text}>Location: {item.location}</Text>
        <Text style={styles.text}>Group: {item.group}</Text>
        {item.recurring && <Text style={styles.recurring}>Recurring: Weekly</Text>}
  
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.subscribeBtn}
            onPress={() => {
              alert(`You subscribed to ${item.name}`);
              console.log(`Subscribed to ${item.name}`);
            }}
          >
            <Text style={styles.btnText}>Subscribe</Text>
          </TouchableOpacity>
  
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => {
              setSelectedItem(item);
              setModalVisible(true);
            }}
          >
            <Text style={styles.btnText}>Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Availability List</Text>
  
        <View style={styles.searchBar}>
          <Ionicons name="menu" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Name or Group"
            value={searchText}
            onChangeText={setSearchText}
          />
          <Ionicons name="search" size={20} />
        </View>
  
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
  
        <TouchableOpacity
          style={styles.managementBtn}
          onPress={() => {
            alert('You will go to Availability Management Page');
            console.log('Go to Management Page');
          }}
        >
          <Text style={styles.managementBtnText}>Manage My Availabilities</Text>
        </TouchableOpacity>
  
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                <Text style={styles.modalTitle}>Availability Details</Text>
                {selectedItem && (
                  <>
                    <Text style={styles.modalText}>Name: {selectedItem.name}</Text>
                    <Text style={styles.modalText}>Date: {selectedItem.date}</Text>
                    <Text style={styles.modalText}>Time: {selectedItem.timeStart} - {selectedItem.timeEnd}</Text>
                    <Text style={styles.modalText}>Location: {selectedItem.location}</Text>
                    <Text style={styles.modalText}>Group: {selectedItem.group}</Text>
                    {selectedItem.recurring && (
                      <Text style={styles.modalText}>Recurring: Weekly</Text>
                    )}
                  </>
                )}
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.btnText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
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
      marginBottom: 5,
    },
    text: {
      color: '#ccc',
      fontSize: 14,
      marginBottom: 2,
    },
    recurring: {
      color: '#90ee90',
      marginTop: 4,
      fontStyle: 'italic',
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 10,
    },
    subscribeBtn: {
      backgroundColor: '#4CAF50',
      padding: 8,
      borderRadius: 6,
    },
    detailBtn: {
      backgroundColor: '#2196F3',
      padding: 8,
      borderRadius: 6,
    },
    btnText: {
      color: 'white',
      fontWeight: 'bold',
    },
    managementBtn: {
      backgroundColor: '#FF9800',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 10,
    },
    managementBtnText: {
      color: 'white',
      fontWeight: 'bold',
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
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    modalText: {
      fontSize: 14,
      marginBottom: 8,
    },
    closeBtn: {
      marginTop: 15,
      backgroundColor: '#999',
      padding: 10,
      borderRadius: 6,
      alignItems: 'center',
    },
  });
  
  export default AvailabilityPage;