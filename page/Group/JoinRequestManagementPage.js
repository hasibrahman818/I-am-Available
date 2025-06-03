import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, doc, updateDoc, setDoc, serverTimestamp, increment, getDoc } from 'firebase/firestore';
import { db } from '../../src/firestore/firebase.config.js';

const RequestManagementPage = ({ route, navigation }) => {
  const groupId = route.params?.groupId;

  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (!groupId) {
      Alert.alert('Error', 'No groupId provided');
      return;
    }
    const q = query(
      collection(db, 'group', groupId, 'joinRequests'),
      where('status', '==', 'pending')
    );
    const unsub = onSnapshot(
      q,
      snap => { setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
      err  => { console.error('🔥 joinRequests listener', err); setLoading(false); }
    );
    return unsub;
  }, [groupId]);

  const handleDecision = async (req, decision) => {
    const reqRef = doc(db, 'group', groupId, 'joinRequests', req.id);
    try {
      if (decision === 'accept') {
        const memberRef = doc(db, 'group', groupId, 'members', req.uid);

        const memberExists = (await getDoc(memberRef)).exists();
        if (!memberExists) {
          const userSnap = await getDoc(doc(db, 'user', req.uid));
          const userData = userSnap.exists() ? userSnap.data() : {};

          await setDoc(
            memberRef,
            {
              uid     : req.uid,
              name    : userData.name    ?? '',
              hashtag : userData.hashtag ?? '',
              role    : 'Student',
              joinedAt: serverTimestamp()
            },
            { merge: true }
          );

          await updateDoc(doc(db, 'group', groupId), { memberCount: increment(1) });
        }

        await updateDoc(reqRef, { status: 'accepted', handledAt: serverTimestamp() });
        alert('Accepted – user added to the group.');
      } else {
        await updateDoc(reqRef, { status: 'rejected', handledAt: serverTimestamp() });
        alert('Rejected – request closed.');
      }
    } catch (e) {
      console.error('handleDecision', e);
      alert('Error. Operation failed');
    }
  };

  const s = searchText.toLowerCase();
  const filtered = requests.filter(item => (
    (item.uid ?? '').toString().toLowerCase().includes(s) ||
    (item.reason ?? '').toLowerCase().includes(s)
  ));

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3162F4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="stepbackward" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Join Requests</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by user ID or reason"
        value={searchText}
        onChangeText={setSearchText}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>User: {item.uid}</Text>
            {item.reason ? <Text style={styles.text}>Reason: {item.reason}</Text> : null}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() => handleDecision(item, 'accept')}
              >
                <Text style={styles.btnText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => handleDecision(item, 'reject')}
              >
                <Text style={styles.btnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2e9f3', padding: 20 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#3162F4', borderRadius: 10,
    padding: 10, marginBottom: 10
  },
  headerText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },

  searchInput: { backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 15 },

  card: { backgroundColor: '#333', borderRadius: 12, padding: 15, marginBottom: 15 },
  name: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  text: { color: '#ccc', fontSize: 14, marginBottom: 8 },

  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  acceptBtn: {
    backgroundColor: '#4CAF50', flex: 1,
    padding: 10, borderRadius: 6, marginRight: 8, alignItems: 'center'
  },
  rejectBtn: {
    backgroundColor: '#f44336', flex: 1,
    padding: 10, borderRadius: 6, marginLeft: 8, alignItems: 'center'
  },
  btnText: { color: '#fff', fontWeight: 'bold' }
});

export default RequestManagementPage;
