import { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../src/firestore/firebase.config.js';

const GroupMemberListMainActor = ({ route = {}, navigation, ...props }) => {
  const myUid = auth.currentUser?.uid;          
  const groupId  = route.params?.groupId ?? props.groupId;   
  const groupRef = route.params?.group   ?? props.group   ?? {};  

  const [members, setMembers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search , setSearch]    = useState('');

  const [editing , setEditing ] = useState(null);  
  const [editMdl , setEditMdl ] = useState(false);

  const [detailMdl, setDetailMdl] = useState(false);
  const [detail   , setDetail   ] = useState(null); 

  useEffect(()=>{
    const coll = collection(db,'group',groupId,'members');
    return onSnapshot(
      coll,
      snap => { setMembers(snap.docs.map(d=>({ id:d.id,...d.data()}))); setLoading(false); },
      err  => { console.error('🔥 members listener',err); setLoading(false); }
    );
  },[groupId]);

  const searchKey = search.toLowerCase();
  const filtered  = members.filter(m=>{
      const n = (m.name    ?? '').toString().toLowerCase();
      const h = (m.hashtag ?? '').toString().toLowerCase();  
      return n.includes(searchKey) || h.includes(searchKey);
  });

  const askDelete = (m) =>{
    if (member.id === myUid) {
    Alert.alert('Error', 'You cannot delete yourself from the group.');
    return;
  }

    if (m.role==='Group Owner') return;
    const really = async ()=>{
      try{ await deleteDoc(doc(db,'group',groupId,'members',m.id)); }
      catch(e){ console.error('delete',e); alert('Failed to delete'); }
    };

    if (Platform.OS==='web'){
      if (window.confirm(`Remove ${m.name}?`)) really();
    }else{
      Alert.alert('Confirm',`Remove ${m.name}?`,[
        {text:'Cancel',style:'cancel'},
        {text:'Remove',style:'destructive',onPress:really}
      ]);
    }
  };

  const saveEdit = async ()=>{
    try{
      await updateDoc(doc(db,'group',groupId,'members',editing.id),{ role:editing.role.trim() });
      setEditMdl(false);
    }catch(e){ console.error('edit',e); alert('Failed'); }
  };

const openDetails = async (member) => {
  setDetail(null);          
  setDetailMdl(true);

  try {
    const uid = member.uid || member.id;
    if (!uid) { setDetail({ notFound:true }); return; }

    const snap = await getDoc(doc(db, 'user', uid));
    if (snap.exists())      setDetail(snap.data());
    else                    setDetail({ notFound:true });
  } catch (e) {
    console.error('fetch user', e);
    setDetail({ error:true });
  }
};

  const Item = ({item})=> {
    const isMe = item.id === myUid;
    return (
    <View style={styles.card}>
      <View style={{flex:1}}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.role}>Role: {item.role}</Text>
        <Text style={styles.hashtag}>Hashtag: {item.hashtag}</Text>
      </View>

      <View style={styles.btnCol}>
        <TouchableOpacity style={styles.detailsBtn} onPress={()=>openDetails(item)}>
          <Text style={styles.txtWhite}>Details</Text>
        </TouchableOpacity>

        {!isMe && item.role!=='Group Owner' && (
          <>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={()=>{ setEditing({...item}); setEditMdl(true);} }>
              <Text style={styles.txtBlack}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={()=>askDelete(item)}>
              <Text style={styles.txtWhite}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
    );
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
          <AntDesign name="arrowleft" size={24} color="#333"/>
        </TouchableOpacity>
        <Text style={styles.header}>{groupRef.name ?? 'Group'} Members</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="menu" size={20} color="#333"/>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Member Name or Hashtag"
          value={search}
          onChangeText={setSearch}/>
        <Ionicons name="search" size={20} color="#3162F4"/>
      </View>

      <FlatList
        data={filtered}
        renderItem={Item}
        keyExtractor={i=>i.id}
        contentContainerStyle={{paddingBottom:110}}/>

      <View style={styles.footerBtn}>
        <TouchableOpacity
          style={styles.reqBtn}
          onPress={()=>navigation.navigate('RequestManagement',{ groupId })}>
          <Text style={styles.footerTxt}>Request Management</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.inviteBtn}
          onPress={()=>navigation.navigate('GroupMemberListCreate',{ groupId, group: groupRef })}>
          <Text style={styles.footerTxt}>Invite Member</Text>
        </TouchableOpacity>
      </View>


      <Modal transparent animationType="fade" visible={editMdl}>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <ScrollView>
              <Text style={styles.modalTitle}>Edit Role</Text>
              <Text style={{marginBottom:8}}>Member: {editing?.name}</Text>
              <TextInput
                style={styles.input}
                placeholder="Role (e.g. Moderator)"
                value={editing?.role}
                onChangeText={t=>setEditing(p=>({...p,role:t}))}/>
              <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                <Text style={styles.txtWhite}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={()=>setEditMdl(false)}>
                <Text style={styles.txtWhite}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="fade" visible={detailMdl}>
        <View style={styles.overlay}>
          <View style={[styles.modalBox,{maxHeight:'85%'}]}>
            <ScrollView>
              <Text style={styles.modalTitle}>Member Details</Text>

              {detail===null && (
                <ActivityIndicator size="large" color="#3162F4" style={{marginTop:20}}/>
              )}

              {detail?.notFound && (
                <Text>No user document found.</Text>
              )}

              {detail?.error && (
                <Text>Failed to fetch user data.</Text>
              )}

              {detail && !detail.notFound && !detail.error && Object.entries(detail).map(([k,v])=>(
                <View key={k} style={{marginBottom:6}}>
                  <Text style={{fontWeight:'bold'}}>{k}</Text>
                  <Text>{JSON.stringify(v)}</Text>
                </View>
              ))}

              <TouchableOpacity style={styles.cancelBtn} onPress={()=>setDetailMdl(false)}>
                <Text style={styles.txtWhite}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#e9e4e4',padding:20},
  headerRow:{flexDirection:'row',alignItems:'center',marginBottom:10},
  header:{fontSize:18,fontWeight:'bold',marginLeft:12,color:'#3162F4'},

  searchBar:{backgroundColor:'#fff',flexDirection:'row',alignItems:'center',
             paddingHorizontal:12,borderRadius:10,marginBottom:15},
  searchInput:{flex:1,marginHorizontal:10,paddingVertical:10},

  card:{backgroundColor:'#9f9595',padding:12,borderRadius:10,marginBottom:12},
  name:{fontWeight:'bold',fontSize:15,color:'#fff'},
  role:{color:'#fff',fontSize:13},
  hashtag:{color:'#fff',fontSize:13},

  btnCol:{flexDirection:'row',justifyContent:'flex-end',gap:8,marginTop:10},
  detailsBtn:{backgroundColor:'#444',paddingVertical:6,paddingHorizontal:10,borderRadius:6},
  editBtn:{backgroundColor:'#90ee90',paddingVertical:6,paddingHorizontal:10,borderRadius:6},
  deleteBtn:{backgroundColor:'#e53935',paddingVertical:6,paddingHorizontal:10,borderRadius:6},
  txtWhite:{color:'#fff',fontWeight:'bold'}, txtBlack:{color:'#333',fontWeight:'bold'},

  footerBtn:{position:'absolute',bottom:20,width:'100%',alignItems:'center',gap:12},
  reqBtn:{backgroundColor:'#3162F4',width:'100%',alignItems:'center',padding:12,borderRadius:10},
  inviteBtn:{backgroundColor:'#4CAF50',width:'100%',alignItems:'center',padding:12,borderRadius:10},
  footerTxt:{color:'#fff',fontWeight:'bold'},

  overlay:{flex:1,backgroundColor:'rgba(0,0,0,0.45)',justifyContent:'center',alignItems:'center'},
  modalBox:{backgroundColor:'#fff',borderRadius:10,padding:20,width:'85%',maxHeight:'80%'},
  modalTitle:{fontSize:18,fontWeight:'bold',marginBottom:12},
  input:{borderColor:'#ccc',borderWidth:1,borderRadius:8,padding:10,marginBottom:12},
  saveBtn:{backgroundColor:'#4CAF50',padding:12,borderRadius:8,alignItems:'center',marginBottom:10},
  cancelBtn:{backgroundColor:'#999',padding:10,borderRadius:8,alignItems:'center'}
});

export default GroupMemberListMainActor;