import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Alert, Modal, TextInput, ScrollView, Platform
} from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import {
  doc, setDoc, deleteDoc, getDoc, onSnapshot, updateDoc,
  increment, collection, addDoc, serverTimestamp, query, where, getDocs
} from 'firebase/firestore';
import { db, auth } from '../../src/firestore/firebase.config.js';

const GroupDetailsPageSecActor = ({ route = {}, navigation, ...props }) => {
  const groupId  = route.params?.groupId ?? props.groupId ?? null;
  const groupObj = route.params?.group   ?? props.group   ?? null;

  const [group, setGroup] = useState(
    groupObj ?? {
      id:'fallback', name:'Demo Group', description:'Preview only',
      status:'working', hashtag:'#demo', public:true, autoAdmission:false,
      memberCount:0
    });
  const [loading,   setLoading]   = useState(!!groupId && !groupObj);
  const [isMember,  setIsMember]  = useState(false);
  const [requested, setRequested] = useState(false);

  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!groupId) return;
    return onSnapshot(
      doc(db,'group',groupId),
      snap => { if (snap.exists()) setGroup({ id:snap.id, ...snap.data() }); setLoading(false); },
      err  => { console.error('🔥 group listener',err); setLoading(false); }
    );
  }, [groupId]);

  useEffect(() => {
    if (!groupId) return;
    return onSnapshot(
      doc(db,'group',groupId,'members',uid),
      snap => setIsMember(snap.exists())
    );
  }, [groupId, uid]);

  useEffect(() => {
    if (!groupId) return;
    (async () => {
      const q = query(
        collection(db,'group',groupId,'joinRequests'),
        where('uid','==',uid), where('status','==','pending')
      );
      const snap = await getDocs(q);
      setRequested(!snap.empty);
    })();
  }, [groupId, uid]);

  const joinPublic = async () => {
    if (!groupId) return;
    try {
      const memberRef = doc(db,'group',groupId,'members',uid);
      if ((await getDoc(memberRef)).exists()) {
        Alert.alert('Info','You are already a member.');
        return;
      }

      const userSnap = await getDoc(doc(db,'user',uid));
      const userData = userSnap.exists() ? userSnap.data() : {};

      await Promise.all([
        setDoc(
          memberRef,
          {
            uid,
            name    : userData.name    ?? '',
            hashtag : userData.hashtag ?? '',
            role    : 'Student',
            joinedAt: serverTimestamp()
          },
          { merge:true }
        ),
        updateDoc(doc(db,'group',groupId), { memberCount: increment(1) })
      ]);

      alert('Joined successfully ✨');
    } catch (e) {
      console.error('join',e);
      Alert.alert('Error','Failed to join');
    }
  };

  const [reasonModal, setReasonModal] = useState(false);
  const [reason,      setReason]      = useState('');
  const [sending,     setSending]     = useState(false);

  const submitRequest = async () => {
    if (!groupId) return;
    try {
      setSending(true);
      await addDoc(
        collection(db,'group',groupId,'joinRequests'),
        { uid, reason: reason.trim(), requestedAt: serverTimestamp(), status:'pending' }
      );
      setRequested(true);
      setReasonModal(false);
      setReason('');
      Alert.alert('Sent','Request submitted');
    } catch (e) {
      console.error('request',e);
      Alert.alert('Error','Failed');
    } finally { setSending(false); }
  };

  const doLeave = async () => {
    if (!groupId) return;
    try {
      const memberRef = doc(db,'group',groupId,'members',uid);
      if (!(await getDoc(memberRef)).exists()) {
        navigation?.goBack?.(); return;
      }
      await Promise.all([
        deleteDoc(memberRef),
        updateDoc(doc(db,'group',groupId), { memberCount: increment(-1) })
      ]);
      navigation?.goBack?.();
    } catch (e) {
      console.error('leave',e);
      alert('Error: Failed to leave');
    }
  };
  const leaveGroup = () => {
    if (!groupId) { alert('Invalid group id'); return; }
    if (Platform.OS === 'web') {
      if (window.confirm('Leave this group?')) doLeave();
    } else {
      Alert.alert('Confirm','Leave this group?',[{text:'Cancel',style:'cancel'},{text:'Leave',style:'destructive',onPress:doLeave}]);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container,{justifyContent:'center',alignItems:'center'}]}>
        <ActivityIndicator size="large" color="#3162F4"/>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={()=>navigation?.goBack?.()}>
          <AntDesign name="arrowleft" size={24} color="#3162F4"/>
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
        <Text style={styles.text}>Members: {group.memberCount ?? 0}</Text>
      </View>

        <TouchableOpacity style={styles.button} onPress={() => 
            navigation.navigate(
              'ChatTab',                 
              {                          
                screen : 'GroupChat',
                params : {
                  id  : group.id,        
                  name: group.name,      
                  type: 'group'          
                }
              }
            )
          }
        >
        <Ionicons name="chatbubble-ellipses" size={20} color="#fff"/>
        <Text style={styles.btnText}>Message Group</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={()=>navigation.navigate('GroupMemberListSec',{
          groupId: group.id,
          group  : { name: group.name, hashtag: group.hashtag }
        })}>
        <AntDesign name="team" size={20} color="#fff"/>
        <Text style={styles.btnText}>View Member List</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() =>
            navigation.navigate( 'ChatTab',
              {
                screen : 'PrivateChat',
                params : {
                  id  : group.ownerId ?? '',         
                  name: 'Group Owner',
                  type: 'user'
                }
              }
            )
          }
        >
        <Ionicons name="mail" size={20} color="#fff"/>
        <Text style={styles.btnText}>Message Owner</Text>
      </TouchableOpacity>

      {isMember ? (
        <TouchableOpacity style={styles.leaveBtn} onPress={leaveGroup}>
          <AntDesign name="logout" size={20} color="#fff"/>
          <Text style={styles.btnText}>Leave Group</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.joinBtn, requested && {backgroundColor:'#888'}]}
          disabled={requested}
          onPress={()=>{ requested ? null : (group.public ? joinPublic() : setReasonModal(true)); }}>
          <AntDesign name="login" size={20} color="#fff"/>
          <Text style={styles.btnText}>
            {requested ? 'Requested' : (group.public ? 'Join Group' : 'Request to Join')}
          </Text>
        </TouchableOpacity>
      )}

      <Modal transparent animationType="fade" visible={reasonModal}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <ScrollView>
              <Text style={styles.modalTitle}>Request to Join</Text>
              <Text style={styles.modalHint}>Reason (optional)</Text>
              <TextInput
                style={[styles.input,{height:100}]}
                multiline placeholder="Write something..."
                value={reason} onChangeText={setReason}/>
              <TouchableOpacity
                style={[styles.submitBtn,{opacity:sending?0.6:1}]}
                disabled={sending}
                onPress={submitRequest}>
                <Text style={styles.btnText}>{sending?'Sending…':'Submit'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn,{backgroundColor:'#888'}]}
                onPress={()=>setReasonModal(false)}>
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
  container:{flex:1,backgroundColor:'#f9f9f9',padding:20},
  headerRow:{flexDirection:'row',alignItems:'center',marginBottom:15},
  header:{fontSize:20,fontWeight:'bold',marginLeft:12,color:'#3162F4'},

  card:{backgroundColor:'#333',borderRadius:12,padding:16,marginBottom:20},
  title:{fontSize:18,fontWeight:'bold',color:'#fff',marginBottom:10},
  text:{fontSize:14,color:'#ccc',marginBottom:6},

  button:{backgroundColor:'#3162F4',flexDirection:'row',alignItems:'center',
          padding:12,borderRadius:10,marginBottom:12,justifyContent:'center',gap:8},

  joinBtn:{backgroundColor:'#4CAF50',flexDirection:'row',alignItems:'center',
           padding:12,borderRadius:10,marginTop:20,justifyContent:'center',gap:8},
  leaveBtn:{backgroundColor:'#f44336',flexDirection:'row',alignItems:'center',
            padding:12,borderRadius:10,marginTop:20,justifyContent:'center',gap:8},
  btnText:{color:'#fff',fontWeight:'bold'},

  overlay:{flex:1,backgroundColor:'rgba(0,0,0,0.45)',justifyContent:'center',alignItems:'center'},
  modalCard:{backgroundColor:'#fff',borderRadius:10,padding:20,width:'85%',maxHeight:'80%'},
  modalTitle:{fontSize:18,fontWeight:'bold',marginBottom:12,color:'#3162F4'},
  modalHint:{color:'#666',marginBottom:8},
  input:{borderColor:'#ccc',borderWidth:1,borderRadius:8,padding:10,marginBottom:12},
  submitBtn:{backgroundColor:'#4CAF50',padding:12,borderRadius:8,alignItems:'center',marginBottom:10},
});

export default GroupDetailsPageSecActor;
