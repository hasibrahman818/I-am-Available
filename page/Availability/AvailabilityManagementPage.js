import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Switch, ScrollView, ActivityIndicator, Platform, Alert } from 'react-native';
import { collection, query, where, onSnapshot, Timestamp, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, auth } from '../../src/firestore/firebase.config.js';
import { onAuthStateChanged } from 'firebase/auth';     




const pad = n => n.toString().padStart(2, '0'); 
const splitDateTime = ts => {
  if (!ts?.toDate) return { date: '', time: '' };
  const d = ts.toDate();
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
};
const mergeDateTime = (dateStr, timeStr) => {
  const [y, m, d]   = dateStr.split('-').map(Number);
  const [hh, mm]    = timeStr.split(':').map(Number);
  return Timestamp.fromDate(new Date(y, m - 1, d, hh ?? 0, mm ?? 0, 0));
};

const AvailabilityManagementPage = () =>{
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [edit,    setEdit]    = useState(null);
  const [uid,       setUid]       = useState(null);
  const [userName,  setUserName]  = useState('');

useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { setUid(null); return; }

      setUid(u.uid);

      const snap = await getDoc(doc(db, 'user', u.uid));
      if (snap.exists()) setUserName(snap.data().name ?? '');
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!uid) return;                               
    const q = query(collection(db, 'availabilities'), where('uid', '==', uid));
    const unsub = onSnapshot(
      q,
      snap => {
        const arr = snap.docs.map(d => {
          const data = d.data();
          const { date: dt, time: ts } = splitDateTime(data.start);
          const { time: te }           = splitDateTime(data.end);
          return {
            id        : d.id,
            date      : dt,
            timeStart : ts,
            timeEnd   : te,
            location  : data.location ?? '',
            group     : data.group    ?? '',
            recurring : !!data.recurring,
          };
        });
        setItems(arr);
        setLoading(false);
      },
      err => { console.error('🔥 avail listener', err); setLoading(false); },
    );
    return unsub;
  }, [uid]);                                        

  const askDelete = (id) => {
    const really = async () => {
      try { await deleteDoc(doc(db, 'availabilities', id)); }
      catch (e) { console.error('delete', e); alert('Delete failed'); }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Delete this record?')) really();
    } else {
      Alert.alert('Confirm', 'Delete this record?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: really },
      ]);
    }
  };

  const save = async () => {
    if (!edit.date || !edit.timeStart || !edit.timeEnd) {
      alert('Date / Time cannot be empty'); return;
    }
    if (!uid) { alert('User not ready'); return; }

    const payload = {
      uid,
      name      : userName,
      start     : mergeDateTime(edit.date, edit.timeStart),
      end       : mergeDateTime(edit.date, edit.timeEnd),
      location  : edit.location.trim(),
      group     : edit.group.trim(),
      recurring : !!edit.recurring,
      updatedAt : serverTimestamp(),
    };

    try {
      if (edit.id) {
        await updateDoc(doc(db, 'availabilities', edit.id), payload);
      } else {
        await addDoc(collection(db, 'availabilities'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      setModal(false);
    } catch (e) {
      console.error('save', e);
      alert('Save failed');
    }
  };

  const RenderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.date} {item.timeStart}-{item.timeEnd}</Text>
      <Text style={styles.text}>Location: {item.location}</Text>
      <Text style={styles.text}>Group   : {item.group}</Text>
      {item.recurring && <Text style={styles.recurring}>Recurring · Weekly</Text>}

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => { setEdit({ ...item }); setModal(true); }}
        >
          <Text style={styles.btnTxt}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.delBtn}
          onPress={() => askDelete(item.id)}
        >
          <Text style={styles.btnTxt}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!uid||loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3162F4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Availabilities</Text>

      <FlatList
        data={items}
        renderItem={RenderItem}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => {
          setEdit({
            date: '', timeStart: '', timeEnd: '',
            location: '', group: '', recurring: false,
          });
          setModal(true);
        }}
      >
        <Text style={styles.createTxt}>+ New Availability</Text>
      </TouchableOpacity>

      <Modal transparent animationType="fade" visible={modal}>
        {edit && (
          <View style={styles.overlay}>
            <View style={styles.modalBox}>
              <ScrollView>
                <Text style={styles.mTitle}>{edit.id ? 'Edit' : 'Create'} Availability</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Date (YYYY-MM-DD)"
                  value={edit.date}
                  onChangeText={t => setEdit(p => ({ ...p, date: t }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Start Time (HH:mm)"
                  value={edit.timeStart}
                  onChangeText={t => setEdit(p => ({ ...p, timeStart: t }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="End Time (HH:mm)"
                  value={edit.timeEnd}
                  onChangeText={t => setEdit(p => ({ ...p, timeEnd: t }))}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Location"
                  value={edit.location}
                  onChangeText={t => setEdit(p => ({ ...p, location: t }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Group"
                  value={edit.group}
                  onChangeText={t => setEdit(p => ({ ...p, group: t }))}
                />

                <View style={styles.switchRow}>
                  <Text style={{ fontSize: 15 }}>Recurring Weekly</Text>
                  <Switch
                    value={!!edit.recurring}
                    onValueChange={v => setEdit(p => ({ ...p, recurring: v }))}
                  />
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={save}>
                  <Text style={styles.btnTxt}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(false)}>
                  <Text style={styles.btnTxt}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0eaea', padding: 20 },
  header: {
    fontSize: 20, color: '#fff', backgroundColor: '#3162F4',
    textAlign: 'center', padding: 12, borderRadius: 10, marginBottom: 15,
  },

  card: { backgroundColor: '#444', borderRadius: 12, padding: 15, marginBottom: 12 },
  name: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  text: { color: '#ddd', fontSize: 14, marginBottom: 2 },
  recurring: { color: '#90ee90', fontStyle: 'italic', marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  editBtn: {
    flex: 1, marginRight: 8, backgroundColor: '#2196F3',
    padding: 8, borderRadius: 6, alignItems: 'center',
  },
  delBtn: {
    flex: 1, backgroundColor: '#e53935',
    padding: 8, borderRadius: 6, alignItems: 'center',
  },
  btnTxt: { color: '#fff', fontWeight: 'bold' },

  createBtn: {
    backgroundColor: '#4CAF50', padding: 12,
    borderRadius: 8, alignItems: 'center', marginTop: 10,
  },
  createTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff', borderRadius: 10,
    padding: 20, width: '85%', maxHeight: '90%',
  },
  mTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { backgroundColor: '#eee', borderRadius: 6, padding: 10, marginBottom: 10 },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginVertical: 10,
  },
  saveBtn: {
    backgroundColor: '#4CAF50', padding: 12,
    borderRadius: 6, alignItems: 'center', marginTop: 10,
  },
  cancelBtn: {
    backgroundColor: '#999', padding: 12,
    borderRadius: 6, alignItems: 'center', marginTop: 10,
  },
});

export default AvailabilityManagementPage;