import { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Switch, StyleSheet, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { Ionicons, AntDesign, MaterialIcons, Feather } from '@expo/vector-icons';
import { collection, onSnapshot, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../../src/firestore/firebase.config.js';
import { auth } from '../../src/firestore/firebase.config.js';

const GroupListPage = ({ navigation }) => {
  const [groups,   setGroups]   = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search,   setSearch]   = useState('');

  const [notify,   setNotify]   = useState({});
  const [loading,  setLoading]  = useState(true);

  const [createVisible, setCreateVisible] = useState(false);
  const [gName,    setGName]    = useState('');
  const [gHashtag, setGHashtag] = useState('');
  const [gDesc,    setGDesc]    = useState('');
  const [gPublic,  setGPublic]  = useState(true);
  const [gAuto,    setGAuto]    = useState(false);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'group'),
      snap => {
        const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setGroups(arr);
        setLoading(false);
      },
      err  => { console.error('🔥 group listener', err); setLoading(false); }
    );
    return unsub;
  }, []);

  const goDetails = (item) => {
    const isMainActor = item.ownerId === auth.currentUser?.uid;

    const target = isMainActor ? 'GroupDetailsMain' : 'GroupDetailsSec';
    navigation.navigate(target, { groupId: item.id, group: item });
  };



  useEffect(() => {
    const lower = search.toLowerCase();
    setFiltered(
      groups.filter(g =>
        g.name.toLowerCase().includes(lower) ||
        (g.hashtag ?? '').toLowerCase().includes(lower)
      )
    );
  }, [search, groups]);

  const toggleBell = id => setNotify(p => ({ ...p, [id]: !p[id] }));

  const handleCreate = async () => {
    if (!gName.trim() || !gHashtag.trim()) {
      alert('Name and Hashtag cannot be empty');
      return;
    }
    try {
      setSaving(true);
      await addDoc(collection(db, 'group'), {
        ownerId       : auth.currentUser?.uid,
        name          : gName.trim(),
        hashtag       : gHashtag.trim(),
        description   : gDesc.trim(),
        status        : 'not_working',
        public        : gPublic,
        autoAdmission : gAuto,
        memberCount   : 1,
        createdAt     : serverTimestamp()
      });
      setCreateVisible(false);
      setGName(''); setGHashtag(''); setGDesc('');
      setGPublic(true); setGAuto(false);
      setSearch('');               
    } catch (e) {
      console.error('add group error', e);
      alert('Failed to create group');
    } finally { setSaving(false); }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.cardText}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.text}>Hashtag: {item.hashtag}</Text>
          <Text style={styles.text}>Description: {item.description}</Text>
          <Text style={styles.text}>Status: {item.status}</Text>
          <Text style={styles.text}>Members: {item.memberCount ?? 0}</Text>
          <Text style={styles.text}>Visibility: {item.public ? 'Public' : 'Private'}</Text>
        </View>

        <View style={styles.cardActions}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>🔔</Text>
            <Switch value={!!notify[item.id]} onValueChange={() => toggleBell(item.id)} />
          </View>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() =>
              goDetails(item)
            }>
            <Feather name="info" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
                   onPress={() =>
            navigation.navigate(
              'ChatTab',          
              {
                screen: 'GroupChat',
                params: {
                  id:   item.id,
                  name: item.name,
                  type: 'group',
                },
              }
            )
          }>
            <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Group List</Text>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={20} color="#555" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search group name or hashtag"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity onPress={() => alert('search page')}>
          <MaterialIcons name="travel-explore" size={22} color="#3162F4" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3162F4" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={i => i.id}
          contentContainerStyle={{ paddingBottom: 160 }}
        />
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ChatTab')}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
          <Text style={styles.buttonText}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#4CAF50' }]}
          onPress={() => setCreateVisible(true)}>
          <AntDesign name="plus" size={20} color="#fff" />
          <Text style={styles.buttonText}>Add Group</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={createVisible} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <ScrollView>
              <Text style={styles.modalTitle}>Create Group</Text>

              <TextInput style={styles.input} placeholder="Group Name"
                value={gName} onChangeText={setGName} />
              <TextInput style={styles.input} placeholder="Hashtag (e.g. #MyGroup)"
                value={gHashtag} onChangeText={setGHashtag} />
              <TextInput style={[styles.input, { height: 80 }]} multiline
                placeholder="Description" value={gDesc} onChangeText={setGDesc} />

              <View style={styles.switchRow}>
                <Text style={styles.text}>Public:</Text>
                <Switch value={gPublic} onValueChange={setGPublic} />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.text}>Auto Admission:</Text>
                <Switch value={gAuto} onValueChange={setGAuto} />
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, { opacity: saving ? 0.6 : 1 }]}
                disabled={saving}
                onPress={handleCreate}>
                <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Create'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: '#888' }]}
                onPress={() => setCreateVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2e9f3', padding: 20 },
  header:    { fontSize: 20, color: '#fff', backgroundColor: '#3162F4',
               textAlign: 'center', padding: 12, borderRadius: 12, marginBottom: 15 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee',
               paddingHorizontal: 12, borderRadius: 20, marginBottom: 15 },
  searchInput:{ flex: 1, marginLeft: 10, paddingVertical: 8 },

  card:{ backgroundColor: '#333', padding: 12, borderRadius: 12, marginBottom: 12 },
  cardContent:{ flexDirection: 'row', justifyContent: 'space-between' },
  cardText:{ flex: 3, paddingRight: 10 },
  cardActions:{ flex: 1, justifyContent: 'space-around', alignItems: 'center' },
  name:{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  text:{ color: '#ccc', fontSize: 14, marginBottom: 3 },
  switchRow:{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  switchLabel:{ color: '#fff', marginRight: 4, fontSize: 14 },
  iconBtn:{ backgroundColor: '#555', padding: 6, borderRadius: 6, marginTop: 6 },

  buttonRow:{ flexDirection: 'row', justifyContent: 'space-around',
              position: 'absolute', bottom: 20, left: 20, right: 20 },
  button:{ flexDirection: 'row', alignItems: 'center',
           backgroundColor: '#3162F4', padding: 12, borderRadius: 8, gap: 6 },
  buttonText:{ color: '#fff', fontWeight: 'bold' },

  overlay:{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center', alignItems: 'center' },
  modalCard:{ backgroundColor: '#fff', borderRadius: 10, padding: 20,
              width: '85%', maxHeight: '80%' },
  modalTitle:{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#3162F4' },
  input:{ borderColor: '#ccc', borderWidth: 1, padding: 10,
          borderRadius: 8, marginBottom: 12 },
  submitBtn:{ backgroundColor: '#4CAF50', padding: 12, borderRadius: 8,
              alignItems: 'center', marginBottom: 10 }
});

export default GroupListPage;
