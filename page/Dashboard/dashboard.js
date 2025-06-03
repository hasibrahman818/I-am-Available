import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import {
  collection, onSnapshot, query, where, getDocs
} from 'firebase/firestore';
import { db } from '../../src/firestore/firebase.config.js';
import { MaterialCommunityIcons, Ionicons, AntDesign } from '@expo/vector-icons';

const safeLower = v => String(v ?? '').toLowerCase();

const STATUS_COLOR = { available: 'green', busy: 'orange', not: 'red' };

export default function DashboardScreen() {
  const [users, setUsers]           = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading]       = useState(true);

  const buildStatusMap = availDocs => {
    const map = new Map();
    const now = new Date();
    const weight = { available: 2, busy: 1, not: 0 };

    availDocs.forEach(a => {
      const start = new Date(`${a.date}T${a.timeStart}`);
      const end   = new Date(`${a.date}T${a.timeEnd}`);
      const diff  = (start - now) / 60000;

      let status = 'not', color = STATUS_COLOR.not;
      if (now >= start && now <= end) {
        status = 'available'; color = STATUS_COLOR.available;
      } else if (diff > 0 && diff <= 15) {
        status = 'busy'; color = STATUS_COLOR.busy;
      }

      const prev = map.get(a.name);
      if (!prev || weight[status] > weight[prev.status]) {
        map.set(a.name, { status, color });
      }
    });
    return map;
  };

  useEffect(() => {
    let unsubAvail;
    (async () => {
      setLoading(true);
      try {
        const userSnap = await getDocs(collection(db, 'user'));
        const userArr  = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const todayISO = new Date().toISOString().slice(0, 10);
        const availQ   = query(collection(db, 'availability'),
                               where('date', '>=', todayISO));

        unsubAvail = onSnapshot(availQ, snap => {
          const availArr  = snap.docs.map(d => d.data());
          const statusMap = buildStatusMap(availArr);

          const enriched = userArr.map(u => ({
            ...u,
            ...(statusMap.get(u.name) ?? { status:'Not Available', color:STATUS_COLOR.not })
          }));
          setUsers(enriched);

          const low = safeLower(searchText);
          setFiltered(
            enriched.filter(u =>
              safeLower(u.name).includes(low) ||
              safeLower(u.hashtag).includes(low)
            )
          );
          setLoading(false);
        });
      } catch (err) {
        console.error('🔥 Dashboard load error:', err);
        setLoading(false);
      }
    })();
    return () => unsubAvail?.();
  }, []);

  useEffect(() => {
    const low = safeLower(searchText);
    setFiltered(users.filter(u =>
      safeLower(u.name).includes(low) ||
      safeLower(u.hashtag).includes(low)
    ));
  }, [searchText, users]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      {item.location ? (
        <Text style={styles.location}>{item.location}</Text>
      ) : null}
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: item.color }]} />
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>

      <View style={styles.searchBar}>
        <Ionicons name="menu" size={18} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Name or Hashtag"
          value={searchText}
          onChangeText={setSearchText}
        />
        <Ionicons name="search" size={18} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3162F4" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#e3d6d6', padding: 20 },
  header:        { fontSize: 20, backgroundColor: '#3162F4', color: '#fff',
                   textAlign: 'center', padding: 10, borderRadius: 15, marginBottom: 10 },
  searchBar:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2e9f3',
                   borderRadius: 20, paddingHorizontal: 15, marginBottom: 15, justifyContent: 'space-between' },
  searchInput:   { flex: 1, paddingHorizontal: 10 },
  card:          { backgroundColor: '#333', borderRadius: 12, padding: 15, marginBottom: 12 },
  name:          { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  location:      { color: '#ccc', fontSize: 14, marginVertical: 5 },
  statusRow:     { flexDirection: 'row', alignItems: 'center' },
  statusDot:     { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  statusText:    { color: '#fff', fontSize: 14 },
  floatingButtons:{ position: 'absolute', bottom: 70, right: 20, flexDirection: 'row', gap: 15 },
  iconButton:    { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 25, elevation: 3 },
  bottomNav:     { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
                   backgroundColor: '#f9f2f4', flexDirection: 'row', justifyContent: 'space-around',
                   alignItems: 'center', borderTopColor: '#ccc', borderTopWidth: 1 },
  navItem:       { alignItems: 'center', justifyContent: 'center' },
  activeTab:     { color: '#6a42ff', fontWeight: 'bold' }
});
