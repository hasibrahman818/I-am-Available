import { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/firestore/firebase.config.js';

const GroupMemberListSecActor = ({ route = {}, navigation, ...props }) => {
  const groupId  = route.params?.groupId ?? props.groupId ?? null;
  const groupRef = route.params?.group   ?? props.group   ?? {};  

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(!!groupId);
  const [search , setSearch ] = useState('');

  const [detail , setDetail ] = useState(null);   
  const [modal  , setModal  ] = useState(false);

  useEffect(()=>{
    if (!groupId) return;
    const coll = collection(db,'group',groupId,'members');
    const unsub = onSnapshot(
      coll,
      snap => { setMembers(snap.docs.map(d=>({ id:d.id, ...d.data() }))); setLoading(false); },
      err  => { console.error('🔥 member listener',err); setLoading(false); }
    );
    return unsub;
  },[groupId]);

  const lower = search.toLowerCase();
  const filtered = members.filter(m=>{
    const n = (m.name    ?? '').toLowerCase();
    const h = (m.hashtag ?? '').toLowerCase();
    return n.includes(lower) || h.includes(lower);
  });

  const openDetails = async (m) => {
    try {
      const snap = await getDoc(doc(db,'user',m.id));     
      if (snap.exists()) {
        setDetail({ uid:m.id, ...snap.data(), role:m.role });
      } else {
        setDetail({ uid:m.id, name:m.name, hashtag:m.hashtag, role:m.role });
      }
      setModal(true);
    } catch(e){
      console.error('fetch user',e);
      setDetail({ uid:m.id, name:m.name, hashtag:m.hashtag, role:m.role });
      setModal(true);
    }
  };

  const Item = ({ item }) => (
    <View style={styles.card}>
      <View style={{flex:1}}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.text}>Role: {item.role}</Text>
        <Text style={styles.text}>Hashtag: {item.hashtag}</Text>
      </View>
      <View style={styles.btnCol}>
        <TouchableOpacity style={styles.detailsBtn} onPress={()=>openDetails(item)}>
          <Text style={styles.btnTxt}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.msgBtn}
          onPress={() =>
            navigation.navigate('ChatTab', {        
              screen : 'PrivateChat',                
              params : {                             
                id   : item.id,
                name : item.name ?? 'User',
                type : 'user'                        
              }
            })
          }
        >
          <Text style={styles.btnTxt}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!groupId){
    return <View style={[styles.container,{justifyContent:'center',alignItems:'center'}]}>
      <Text>No group id provided</Text></View>;
  }
  if (loading){
    return <View style={[styles.container,{justifyContent:'center',alignItems:'center'}]}>
      <ActivityIndicator size="large" color="#3162F4"/></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={()=>navigation?.goBack?.()}>
          <AntDesign name="arrowleft" size={24} color="#333"/>
        </TouchableOpacity>
        <Text style={styles.header}>{groupRef.name ?? 'Group'} Members</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="menu"  size={20} color="#444"/>
        <TextInput
          placeholder="Search Member Name or Hashtag"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}/>
        <Ionicons name="search" size={20} color="#444"/>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i=>i.id}
        renderItem={Item}
        contentContainerStyle={{paddingBottom:80}}/>

      <Modal transparent animationType="fade" visible={modal}>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <ScrollView>
              <Text style={styles.mTitle}>User Details</Text>
              {detail && Object.entries(detail).map(([k,v])=>(
                <Text key={k} style={{marginBottom:4}}>{k}: {String(v)}</Text>
              ))}
              <TouchableOpacity style={styles.closeBtn} onPress={()=>setModal(false)}>
                <Text style={styles.btnTxt}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#e8e0dc',padding:20},
  headerRow:{flexDirection:'row',alignItems:'center',marginBottom:15},
  header:{fontSize:18,fontWeight:'bold',marginLeft:10,color:'#3a65db'},
  searchBar:{flexDirection:'row',alignItems:'center',backgroundColor:'#f5f5f5',
             paddingHorizontal:10,borderRadius:20,marginBottom:15},
  searchInput:{flex:1,paddingVertical:8,paddingHorizontal:10,fontSize:14},

  card:{flexDirection:'row',backgroundColor:'#948b8b',borderRadius:12,
        padding:12,marginBottom:12},
  name:{color:'#fff',fontWeight:'bold',fontSize:16,marginBottom:4},
  text:{color:'#eee',fontSize:14},
  btnCol:{justifyContent:'space-between',alignItems:'flex-end'},
  detailsBtn:{backgroundColor:'#444',paddingVertical:4,paddingHorizontal:12,borderRadius:6,marginBottom:8},
  msgBtn:{backgroundColor:'#4CAF50',paddingVertical:4,paddingHorizontal:12,borderRadius:6},
  btnTxt:{color:'#fff',fontWeight:'bold'},

  overlay:{flex:1,backgroundColor:'rgba(0,0,0,0.45)',justifyContent:'center',alignItems:'center'},
  modalBox:{backgroundColor:'#fff',borderRadius:10,padding:20,width:'85%',maxHeight:'80%'},
  mTitle:{fontSize:18,fontWeight:'bold',marginBottom:12},
  closeBtn:{backgroundColor:'#3162F4',padding:10,borderRadius:8,alignItems:'center',marginTop:10}
});

export default GroupMemberListSecActor;
