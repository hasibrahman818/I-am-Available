import { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, doc, setDoc, updateDoc, increment, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, auth } from '../../src/firestore/firebase.config.js';

const GroupMemberListCreatePage = ({ route = {}, navigation, ...props }) => {
  const groupId = route.params?.groupId ?? props.groupId ?? null;

  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'user'),                       
      snap => {
        setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
        setLoading(false);
      },
      err => { console.error('🔥 users listener', err); setLoading(false); }
    );
    return unsub;
  }, []);

  const kw = search.toLowerCase();
  const filtered = users.filter(u => {
    if (u.uid === auth.currentUser?.uid) return false;

    const name  = String(u.name ?? '').toLowerCase();
    const tag   = String(u.hashtag ?? '').toLowerCase();

    const roles = (u.roles ?? []).map(r => String(r).toLowerCase()).join(',');

    return name.includes(kw) || tag.includes(kw) || roles.includes(kw);
  });

  const toggleSelect = uid => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(uid) ? next.delete(uid) : next.add(uid);
      return next;
    });
  };

  const confirmInvite = async () => {
    if (!groupId) { alert('Error: No groupId'); return; }
    if (selected.size === 0) { alert('Select somebody first'); return; }

    try {
      let newAdded = 0;
      const writes = [];

      for (const uid of selected) {
        const memberRef = doc(db, 'group', groupId, 'members', uid);
        if ((await getDoc(memberRef)).exists()) continue; 

        const userSnap = await getDoc(doc(db, 'user', uid));
        const userData = userSnap.exists() ? userSnap.data() : {};

        writes.push(
          setDoc(
            memberRef,
            {
              role     : 'Student',              
              joinedAt : serverTimestamp(),
              name     : userData.name    ?? '',
              hashtag  : userData.hashtag ?? ''
            },
            { merge: true }
          )
        );
        newAdded += 1;
      }

      if (newAdded)
        writes.push(updateDoc(doc(db, 'group', groupId), { memberCount: increment(newAdded) }));

      await Promise.all(writes);
      navigation?.goBack?.();
    } catch (e) {
      console.error('invite members', e);
      alert('Error. Failed to invite');
    }
  };

  const Item = ({ item }) => {
    const picked = selected.has(item.uid);
    return (
      <TouchableOpacity style={styles.card} onPress={() => toggleSelect(item.uid)}>
        <View>
          <Text style={styles.name}>{item.name ?? '—'}</Text>

          <Text style={styles.role}>
            Role:{' '}
            {Array.isArray(item.roles) && item.roles.length
              ? item.roles.join(', ')
              : '—'}
          </Text>

          <Text style={styles.hashtag}>Hashtag: {item.hashtag ?? '—'}</Text>
        </View>

        <View style={[styles.selectBtn, picked && { backgroundColor: '#3162F4' }]}>
          <Text style={styles.selectText}>{picked ? 'Picked' : 'Select'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3162F4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()}>
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.header}>Invite Member</Text>

        <TouchableOpacity
          style={[styles.confirmBtn, { opacity: selected.size ? 1 : 0.5 }]}
          disabled={selected.size === 0}
          onPress={confirmInvite}
        >
          <Text style={styles.confirmText}>Confirm</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="menu" size={20} color="#333" />
        <TextInput
          placeholder="Search Member Name, Hashtag or Role"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        <Ionicons name="search" size={20} color="#3162F4" />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.uid}
        renderItem={Item}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e9e4e4', padding: 20 },
  center: { justifyContent: 'center', alignItems: 'center' },

  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 15
  },
  header: { fontSize: 18, fontWeight: 'bold', color: '#3162F4' },
  confirmBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 8
  },
  confirmText: { color: '#fff', fontWeight: 'bold' },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 12, borderRadius: 10, marginBottom: 15
  },
  searchInput: { flex: 1, marginHorizontal: 10, paddingVertical: 10 },

  card: {
    backgroundColor: '#9f9595', padding: 12, borderRadius: 10, marginBottom: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  name: { fontWeight: 'bold', fontSize: 15, color: '#fff' },
  role: { color: '#fff', fontSize: 13 },
  hashtag: { color: '#fff', fontSize: 13 },

  selectBtn: {
    backgroundColor: '#4CAF50', paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 8
  },
  selectText: { color: '#fff', fontWeight: 'bold' }
});

export default GroupMemberListCreatePage;
