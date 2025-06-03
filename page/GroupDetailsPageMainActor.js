import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, Modal, TextInput, ScrollView, Switch
} from 'react-native';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';

const GroupDetailsPageMainActor = ({ route }) => {
  const initialGroup = route?.params?.group || {
    id: 'g1',
    name: 'XX-2024/25',
    description: 'In the ESTIG library',
    status: 'working',
    hashtag: '#GrpXX2425',
    public: true,
    autoAdmission: false,
    members: ['u1', 'u2'],
  };

  const [group, setGroup] = useState(initialGroup);
  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const [editDesc, setEditDesc] = useState(group.description);
  const [editHashtag, setEditHashtag] = useState(group.hashtag);
  const [editPublic, setEditPublic] = useState(group.public);
  const [editAutoAdmission, setEditAutoAdmission] = useState(group.autoAdmission);

  const handleDisband = () => {
    Alert.alert(
      'Confirm Disband',
      'Are you sure you want to disband this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disband',
          style: 'destructive',
          onPress: () => {
            alert('Group disbanded');
            console.log(`Group ${group.name} disbanded`);
          },
        },
      ]
    );
  };

  const handleSaveChanges = () => {
    setGroup(prev => ({
      ...prev,
      name: editName,
      description: editDesc,
      hashtag: editHashtag,
      public: editPublic,
      autoAdmission: editAutoAdmission,
    }));
    setModalVisible(false);
    Alert.alert('Success', 'Group information updated');
    console.log('Saved group changes:', {
      name: editName,
      description: editDesc,
      hashtag: editHashtag,
      public: editPublic,
      autoAdmission: editAutoAdmission,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => alert('Go back to Group List')}>
          <AntDesign name="arrowleft" size={24} color="#3162F4" />
        </TouchableOpacity>
        <Text style={styles.header}>Group Details</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{group.name}</Text>
        <Text style={styles.text}>Hashtag: {group.hashtag}</Text>
        <Text style={styles.text}>Description: {group.description}</Text>
        <Text style={styles.text}>Status: {group.status}</Text>
        <Text style={styles.text}>Visibility: {group.public ? 'Public' : 'Private'}</Text>
        <Text style={styles.text}>Auto Admission: {group.autoAdmission ? 'Yes' : 'No'}</Text>
        <Text style={styles.text}>Members: {group.members.length}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => alert('Go to Group Chat Page')}>
        <Ionicons name="chatbubble-ellipses" size={20} color="white" />
        <Text style={styles.btnText}>Message Group</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => alert('Go to Join Request Page')}>
        <MaterialIcons name="person-add-alt-1" size={20} color="white" />
        <Text style={styles.btnText}>Manage Join Requests</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => alert('Go to Member List Page')}>
        <AntDesign name="team" size={20} color="white" />
        <Text style={styles.btnText}>View Member List</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <AntDesign name="edit" size={20} color="white" />
        <Text style={styles.btnText}>Edit Group</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.disbandBtn} onPress={handleDisband}>
        <AntDesign name="delete" size={20} color="white" />
        <Text style={styles.btnText}>Disband Group</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Edit Group</Text>

              <TextInput style={styles.input} placeholder="Group Name" value={editName} onChangeText={setEditName} />
              <TextInput style={styles.input} placeholder="Hashtag" value={editHashtag} onChangeText={setEditHashtag} />
              <TextInput style={styles.input} placeholder="Description" value={editDesc} onChangeText={setEditDesc} multiline />

              <View style={styles.switchRow}>
                <Text style={styles.text}>Public Group:</Text>
                <Switch value={editPublic} onValueChange={setEditPublic} />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.text}>Auto Admission:</Text>
                <Switch value={editAutoAdmission} onValueChange={setEditAutoAdmission} />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveChanges}>
                <Text style={styles.btnText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
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
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  header: { fontSize: 20, fontWeight: 'bold', marginLeft: 12, color: '#3162F4' },
  card: { backgroundColor: '#333', borderRadius: 12, padding: 16, marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  text: { fontSize: 14, color: '#ccc', marginBottom: 6 },
  button: {
    backgroundColor: '#3162F4',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    justifyContent: 'center',
    gap: 8,
  },
  disbandBtn: {
    backgroundColor: '#f44336',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    justifyContent: 'center',
    gap: 8,
  },
  btnText: { color: 'white', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '85%',
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: {
    borderColor: '#ccc', borderWidth: 1,
    padding: 10, borderRadius: 8,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: '#4CAF50',
    padding: 12, borderRadius: 8,
    alignItems: 'center', marginBottom: 10,
  },
  cancelBtn: {
    backgroundColor: '#aaa',
    padding: 10, borderRadius: 8,
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
});

export default GroupDetailsPageMainActor;
