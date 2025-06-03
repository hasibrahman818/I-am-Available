import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth } from '../src/firestore/firebase.config.js';

const ALL_POSSIBLE_ROLES = ['Student', 'Tutor', 'Professor', 'Assistant'];

const ManageMyRoleScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [rolesArr, setRolesArr] = useState([]);
  const [loading, setLoading] = useState(true);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;
    const ref = doc(db, 'user', uid);
    const unsub = onSnapshot(
      ref,
      snap => {
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() };
          setUser(data);

          const arr = Array.isArray(data.roles) ? data.roles : [];
          setRolesArr(arr);
        }
        setLoading(false);
      },
      err => {
        console.error('🔥 Load roles err:', err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [uid]);

  const saveAllRoles = async () => {
    if (!uid) return;
    const cleaned = rolesArr
      .map(r => r.trim())
      .filter((r, idx, self) => r !== '' && self.indexOf(r) === idx);
    try {
      await updateDoc(doc(db, 'user', uid), { roles: cleaned });
      Alert.alert('Success', 'Roles updated!');
    } catch (e) {
      console.error('🔥 Update roles err:', e);
      Alert.alert('Error', 'Failed to update roles, please try again.');
    }
  };

  const addEmptyRole = () => {
    setRolesArr(prev => [...prev, '']);
  };

  const removeRoleAt = index => {
    setRolesArr(prev => prev.filter((_, i) => i !== index));
  };

  const changeRoleAt = (index, newValue) => {
    setRolesArr(prev => prev.map((r, i) => (i === index ? newValue : r)));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6a42ff" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>No user data found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.pillBorder}>
          <LinearGradient
            colors={['#5ba9ff', '#1e7bff']}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={styles.pillInner}
          >
            <Text style={styles.pillText}>Manage My Role</Text>
          </LinearGradient>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user.name}</Text>

        <Text style={[styles.label, { marginTop: 14 }]}>Roles</Text>

        {rolesArr.map((r, idx) => (
          <View key={idx} style={styles.roleRow}>
            <Picker
              selectedValue={r}
              onValueChange={val => changeRoleAt(idx, val)}
              style={styles.picker}
              dropdownIconColor="#fff"
            >
              <Picker.Item label="— Select —" value="" color="#888" />
              {ALL_POSSIBLE_ROLES.map(option => (
                <Picker.Item key={option} label={option} value={option} color="#000" />
              ))}
            </Picker>
            <TouchableOpacity
              style={styles.deleteRoleBtn}
              onPress={() => removeRoleAt(idx)}
            >
              <Text style={styles.deleteRoleTxt}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addRoleBtn} onPress={addEmptyRole}>
          <Text style={styles.addRoleTxt}>＋ Add New Role</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBorder} activeOpacity={0.85} onPress={saveAllRoles}>
          <LinearGradient
            colors={['#5ba9ff', '#1e7bff']}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={styles.saveInner}
          >
            <Text style={styles.saveTxt}>Save</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const RADIUS = 22;
const BORDER = 2.5;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#d3c9cb',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 12,
  },
  pillBorder: {
    borderRadius: RADIUS,
    borderWidth: BORDER,
    borderColor: '#0065ff',
    ...Platform.select({
      ios: {
        shadowColor: '#0065ff',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  pillInner: { borderRadius: RADIUS - BORDER, paddingHorizontal: 22, paddingVertical: 6 },
  pillText: { color: '#fff', fontWeight: '600', fontSize: 15 },

  card: {
    backgroundColor: '#3f3f3f',
    borderRadius: 12,
    padding: 18,
  },
  label: { fontSize: 14, color: '#ccc' },
  value: { fontSize: 16, fontWeight: '600', color: '#fff', marginTop: 2 },

  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#555',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    flex: 1,
    color: '#fff',
    backgroundColor: '#666',
    paddingHorizontal: 8,
  },
  deleteRoleBtn: {
    backgroundColor: '#e53935',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  deleteRoleTxt: {
    color: '#fff',
    fontWeight: 'bold',
  },

  addRoleBtn: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addRoleTxt: {
    color: '#fff',
    fontWeight: '600',
  },

  saveBorder: {
    marginTop: 24,
    alignSelf: 'flex-end',
    borderRadius: RADIUS,
    borderWidth: BORDER,
    borderColor: '#0065ff',
  },
  saveInner: { borderRadius: RADIUS - BORDER, paddingHorizontal: 26, paddingVertical: 8 },
  saveTxt: { color: '#fff', fontWeight: '600', fontSize: 15 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default ManageMyRoleScreen;
