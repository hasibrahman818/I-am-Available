import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, Modal, ScrollView, Switch, ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import {
  collection, onSnapshot, addDoc, updateDoc, doc,
  serverTimestamp, query, where, getDocs, getDoc, setDoc, increment
} from 'firebase/firestore';
import { db, auth } from '../../src/firestore/firebase.config.js';

const UID = auth.currentUser?.uid;

const GroupSearchPage = () => {
  const [groups, setGroups]             = useState([]);
  const [filteredGroups, setFiltered]   = useState([]);
  const [searchText, setSearchText]     = useState('');

  const [reqModal, setReqModal]         = useState(false);
  const [selGroup, setSelGroup]         = useState(null);
  const [joinNote, setJoinNote]         = useState('');
  const [sending, setSending]           = useState(false);

  const [createModal, setCreateModal]   = useState(false);
  const [gName, setGName]               = useState('');
  const [gDesc, setGDesc]               = useState('');
  const [gTag, setGTag]                 = useState('');
  const [isPub, setIsPub]               = useState(true);
  const [autoAd, setAutoAd]             = useState(false);
  const [creating, setCreating]         = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'group'),
      snap => setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err  => console.error('🔥 group listener', err)
    );
    return unsub;
  }, []);

  useEffect(() => {
    const kw = searchText.toLowerCase();
    setFiltered(
      groups.filter(g =>
        g.name.toLowerCase().includes(kw) ||
        (g.hashtag ?? '').toLowerCase().includes(kw)
      )
    );
  }, [searchText, groups]);

  const joinPublic = async (grp) => {
    try {
      const memberRef = doc(db, 'group', grp.id, 'members', UID);
      if ((await getDoc(memberRef)).exists()) {
        alert('You are already a member.');
        return;
      }
      await Promise.all([
        setDoc(memberRef, {
          role     : 'Student',
          joinedAt : serverTimestamp(),
          uid      : UID
        }, { merge: true }),
        updateDoc(doc(db, 'group', grp.id), { memberCount: increment(1) })
      ]);
      alert(`Joined ${grp.name}`);
    } catch (e) {
      console.error('join', e);
      alert('Failed to join');
    }
  };

  const handleRequest = (grp) => {
    if (grp.public && grp.autoAdmission) {
      joinPublic(grp);
    } else {
      setSelGroup(grp);
      setReqModal(true);
    }
  };

  const sendJoinRequest = async () => {
    if (!selGroup) return;
    try {
      setSending(true);

      const qry = query(
        collection(db, 'group', selGroup.id, 'joinRequests'),
        where('uid', '==', UID),
        where('status', '==', 'pending')
      );
      const dup = await getDocs(qry);
      if (!dup.empty) { alert('You already requested'); setSending(false); return; }

      await addDoc(
        collection(db, 'group', selGroup.id, 'joinRequests'),
        { uid: UID, reason: joinNote.trim(), requestedAt: serverTimestamp(), status: 'pending' }
      );
      alert('Request sent');
      setReqModal(false);
      setJoinNote('');
    } catch (e) {
      console.error('request', e);
      alert('Failed');
    } finally { setSending(false); }
  };

  const createGroup = async () => {
    if (!gName.trim() || !gTag.trim()) { alert('Name & Hashtag required'); return; }
    setCreating(true);
    try {
      const ref = await addDoc(collection(db, 'group'), {
        name          : gName.trim(),
        description   : gDesc.trim(),
        hashtag       : gTag.trim(),
        status        : 'not_working',
        public        : isPub,
        autoAdmission : autoAd,
        memberCount   : 1,
        ownerId       : UID,
        createdAt     : serverTimestamp()
      });

      await setDoc(doc(db, 'group', ref.id, 'members', UID), {
        role     : 'Owner',
        joinedAt : serverTimestamp(),
        uid      : UID
      });

      alert(`Group "${gName}" created`);
      setCreateModal(false);
      setGName(''); setGDesc(''); setGTag('');
      setIsPub(true); setAutoAd(false);
    } catch (e) {
      console.error('create', e);
      alert('Create failed');
    } finally { setCreating(false); }
  };

  const RenderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.text}>Hashtag: {item.hashtag}</Text>
      <Text style={styles.text}>Description: {item.description}</Text>
      <Text style={styles.text}>Members: {item.memberCount ?? 0}</Text>
      <Text style={styles.text}>Visibility: {item.public ? 'Public' : 'Private'}</Text>
      <Text style={styles.text}>Auto Admission: {item.autoAdmission ? 'Yes' : 'No'}</Text>

      <TouchableOpacity style={styles.joinBtn} onPress={() => handleRequest(item)}>
        <Text style={styles.btnText}>
          {item.public && item.autoAdmission ? 'Join' : 'Request Join'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const isLoading = groups.length === 0;

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

      {isLoading ? (
        <View style={{ alignItems: 'center', marginTop: 30 }}>
          <ActivityIndicator color="#3162F4" />
        </View>
      ) : (
        <FlatList
          data={filteredGroups}
          renderItem={RenderItem}
          keyExtractor={i => i.id}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity style={styles.addBtn} onPress={() => setCreateModal(true)}>
        <AntDesign name="plus" size={20} color="#fff" />
        <Text style={styles.addBtnText}>Create Group</Text>
      </TouchableOpacity>

      <Modal transparent visible={reqModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Join Request</Text>

              {selGroup && (
                <>
                  <Text style={styles.modalText}>Name: {selGroup.name}</Text>
                  <Text style={styles.modalText}>Hashtag: {selGroup.hashtag}</Text>
                  <Text style={styles.modalText}>Description: {selGroup.description}</Text>
                  <Text style={styles.modalText}>Visibility: {selGroup.public ? 'Public' : 'Private'}</Text>
                </>
              )}

              <TextInput
                style={[styles.input, { height: 100 }]}
                placeholder="Reason (optional)"
                value={joinNote}
                onChangeText={setJoinNote}
                multiline
              />

              <TouchableOpacity
                style={[styles.sendBtn, { opacity: sending ? 0.6 : 1 }]}
                disabled={sending}
                onPress={sendJoinRequest}
              >
                <Text style={styles.btnText}>Send Request</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setReqModal(false)}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={createModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Create New Group</Text>

              <TextInput
                style={styles.input}
                placeholder="Group Name"
                value={gName}
                onChangeText={setGName}
              />
              <TextInput
                style={styles.input}
                placeholder="Hashtag (e.g. #MyGroup)"
                value={gTag}
                onChangeText={setGTag}
              />
              <TextInput
                style={[styles.input, { height: 90 }]}
                placeholder="Description"
                value={gDesc}
                onChangeText={setGDesc}
                multiline
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Public:</Text>
                <Switch value={isPub} onValueChange={setIsPub} />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Auto Admission:</Text>
                <Switch value={autoAd} onValueChange={setAutoAd} />
              </View>

              <TouchableOpacity
                style={[styles.sendBtn, { opacity: creating ? 0.6 : 1 }]}
                disabled={creating}
                onPress={createGroup}
              >
                <Text style={styles.btnText}>{creating ? 'Creating…' : 'Create'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCreateModal(false)}>
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
    fontSize: 20, backgroundColor: '#3162F4', color: '#fff',
    textAlign: 'center', padding: 10, borderRadius: 12, marginBottom: 10
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee',
    paddingHorizontal: 12, borderRadius: 20, marginBottom: 15
  },
  searchInput: { flex: 1, marginLeft: 10, paddingVertical: 8 },

  card: { backgroundColor: '#333', padding: 15, borderRadius: 12, marginBottom: 12 },
  name: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  text: { color: '#ccc', fontSize: 14, marginBottom: 3 },
  joinBtn: { marginTop: 10, backgroundColor: '#3162F4', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },

  addBtn: {
    position: 'absolute', bottom: 25, right: 20, backgroundColor: '#4CAF50',
    flexDirection: 'row', padding: 12, borderRadius: 10, alignItems: 'center', gap: 6
  },
  addBtnText: { color: '#fff', fontWeight: 'bold' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff', borderRadius: 10, padding: 20,
    width: '85%', maxHeight: '80%'
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  modalText: { fontSize: 14, marginBottom: 8 },
  input: { borderColor: '#ccc', borderWidth: 1, padding: 10, borderRadius: 8, marginBottom: 12 },
  sendBtn: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  cancelBtn: { backgroundColor: '#aaa', padding: 10, borderRadius: 8, alignItems: 'center' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  switchLabel: { fontSize: 14 }
});

export default GroupSearchPage;
