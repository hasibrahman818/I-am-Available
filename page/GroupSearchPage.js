import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, Modal, ScrollView, Switch
} from 'react-native';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import groupData from '../assets/data/groups.json';

const GroupSearchPage = () => {
  const [searchText, setSearchText] = useState('');
  const [groups, setGroups] = useState(groupData);
  const [filteredGroups, setFilteredGroups] = useState(groupData);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [joinReason, setJoinReason] = useState('');

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupHashtag, setNewGroupHashtag] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [autoAdmission, setAutoAdmission] = useState(false);

  useEffect(() => {
    const filtered = groups.filter(group =>
      group.name.toLowerCase().includes(searchText.toLowerCase()) ||
      group.hashtag.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredGroups(filtered);
  }, [searchText, groups]);

  const handleRequest = (group) => {
    if (group.public && group.autoAdmission) {
      alert(`You joined ${group.name}`);
      console.log(`Auto-joined: ${group.name}`);
    } else {
      setSelectedGroup(group);
      setModalVisible(true);
    }
  };

  const handleSendJoinRequest = () => {
    alert('Request Sent', `Group: ${selectedGroup.name}\nReason: ${joinReason || 'No reason'}`);
    console.log(`Join request for ${selectedGroup.name} with reason: ${joinReason}`);
    setModalVisible(false);
    setJoinReason('');
  };

  const handleCreateGroup = () => {
    if (!newGroupName || !newGroupHashtag) {
      alert('Please fill in group name and hashtag');
      return;
    }

    const newGroup = {
      id: `g${Date.now()}`,
      name: newGroupName,
      hashtag: newGroupHashtag,
      description: newGroupDesc,
      status: 'not_working',
      mainActorId: 'u_current',
      members: ['u_current'],
      public: isPublic,
      autoAdmission: autoAdmission,
      memberCount: 1
    };

    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);

    setCreateModalVisible(false);
    setNewGroupName('');
    setNewGroupHashtag('');
    setNewGroupDesc('');
    setIsPublic(true);
    setAutoAdmission(false);

    alert(`Group "${newGroupName}" created!`);
    console.log('Created Group:', newGroup);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.text}>Hashtag: {item.hashtag}</Text>
      <Text style={styles.text}>Description: {item.description}</Text>
      <Text style={styles.text}>Members: {item.memberCount}</Text>
      <Text style={styles.text}>Visibility: {item.public ? 'Public' : 'Private'}</Text>
      <Text style={styles.text}>Auto Admission: {item.autoAdmission ? 'Yes' : 'No'}</Text>

      <TouchableOpacity
        style={styles.joinBtn}
        onPress={() => handleRequest(item)}
      >
        <Text style={styles.btnText}>Request Join</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Group Search</Text>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search group name or hashtag"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity onPress={() => alert('Go to Request Management Page')}>
          <MaterialIcons name="manage-accounts" size={22} color="#3162F4" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredGroups}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setCreateModalVisible(true)}
      >
        <AntDesign name="plus" size={20} color="#fff" />
        <Text style={styles.addBtnText}>Create Group</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Join Request</Text>
              {selectedGroup && (
                <>
                  <Text style={styles.modalText}>Name: {selectedGroup.name}</Text>
                  <Text style={styles.modalText}>Hashtag: {selectedGroup.hashtag}</Text>
                  <Text style={styles.modalText}>Description: {selectedGroup.description}</Text>
                  <Text style={styles.modalText}>Visibility: {selectedGroup.public ? 'Public' : 'Private'}</Text>
                </>
              )}
              <TextInput
                style={styles.input}
                placeholder="Reason for joining (optional)"
                value={joinReason}
                onChangeText={setJoinReason}
                multiline
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleSendJoinRequest}>
                <Text style={styles.btnText}>Send Request</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={createModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Create New Group</Text>
              <TextInput
                style={styles.input}
                placeholder="Group Name"
                value={newGroupName}
                onChangeText={setNewGroupName}
              />
              <TextInput
                style={styles.input}
                placeholder="Hashtag (e.g. #MyGroup2025)"
                value={newGroupHashtag}
                onChangeText={setNewGroupHashtag}
              />
              <TextInput
                style={styles.input}
                placeholder="Group Description"
                value={newGroupDesc}
                onChangeText={setNewGroupDesc}
                multiline
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Public:</Text>
                <Switch value={isPublic} onValueChange={setIsPublic} />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Auto Admission:</Text>
                <Switch value={autoAdmission} onValueChange={setAutoAdmission} />
              </View>

              <TouchableOpacity
                style={styles.selectBtn}
                onPress={() => alert('Go to Select Group Member Page')}
              >
                <AntDesign name="pluscircleo" size={18} color="#3162F4" />
                <Text style={styles.selectText}> Select Group Members</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sendBtn} onPress={handleCreateGroup}>
                <Text style={styles.btnText}>Create</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCreateModalVisible(false)}>
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
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
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
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
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
  joinBtn: {
    marginTop: 10,
    backgroundColor: '#3162F4',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addBtn: {
    position: 'absolute',
    bottom: 25,
    right: 20,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    gap: 6,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
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
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  sendBtn: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelBtn: {
    backgroundColor: '#aaa',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 14,
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
  },
  selectText: {
    color: '#3162F4',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default GroupSearchPage;
