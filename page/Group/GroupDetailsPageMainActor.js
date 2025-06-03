import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Switch, ActivityIndicator, Alert, Platform } from 'react-native';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { doc, onSnapshot, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../../src/firestore/firebase.config.js';

const GroupDetailsPageMainActor = ({ route = {}, navigation, ...props })  => {

  const groupId  = route.params?.groupId ?? props.groupId ?? null;
  const groupObj = route.params?.group   ?? props.group   ?? null;
  const [group, setGroup] = useState(groupObj ?? {
    id:'fallback', name:'Demo Group', description:'Preview only',
    status:'working', hashtag:'#Demo', public:true, autoAdmission:false,
    members:[], memberCount:0
  });
  const [loading, setLoading] = useState(!!groupId && !groupObj);

  useEffect(()=>{
    if (!groupId) return;
    const ref = doc(db,'group',groupId);
    return onSnapshot(ref,
      snap => { if (snap.exists()) setGroup({ id:snap.id, ...snap.data() }); setLoading(false); },
      err  => { console.error('🔥 group listener',err); setLoading(false); }
    );
  },[groupId]);

  const [editVisible,setEditVisible] = useState(false);
  const [name, setName] = useState(group.name);
  const [desc, setDesc] = useState(group.description);
  const [tag,  setTag]  = useState(group.hashtag);
  const [pub,  setPub]  = useState(group.public);
  const [auto, setAuto] = useState(group.autoAdmission);
  const [saving,setSaving]= useState(false);

  useEffect(()=>{
    setName(group.name); setDesc(group.description);
    setTag(group.hashtag); setPub(group.public);
    setAuto(group.autoAdmission);
  },[group]);

  const openEdit = async ()=>{
    if (groupId){
      try{
        const snap = await getDoc(doc(db,'group',groupId));
        if (snap.exists()){
          const g=snap.data();
          setName(g.name); setDesc(g.description);
          setTag(g.hashtag); setPub(g.public); setAuto(g.autoAdmission);
        }
      }catch(e){ console.error('fetch latest group',e); }
    }
    setEditVisible(true);
  };

  const save = useCallback(async ()=>{
    if(!name.trim() || !tag.trim()){ alert('Name & Hashtag cannot be empty'); return; }
    if(!groupId){                                     
      setGroup(p=>({...p,
        name:name.trim(),description:desc.trim(),hashtag:tag.trim(),
        public:pub,autoAdmission:auto
      }));
      setEditVisible(false); return;
    }
    try{
      setSaving(true);
      await updateDoc(doc(db,'group',groupId),{
        name:name.trim(),
        description:desc.trim(),
        hashtag:tag.trim(),
        public:pub,
        autoAdmission:auto
      });
      setEditVisible(false);
    }catch(e){ console.error('update',e); alert('Save failed'); }
    finally{ setSaving(false); }
  },[name,desc,tag,pub,auto,groupId]);

  const doDisband = async ()=>{
    try{ await deleteDoc(doc(db,'group',groupId)); navigation?.goBack?.(); }
    catch(e){ console.error('delete',e); alert('Disband failed'); }
  };
  const disband = ()=>{
    if(!groupId){ Alert.alert('Invalid id'); return; }
    if(Platform.OS==='web'){
      if(window.confirm('Disband this group?')) doDisband();
    }else{
      Alert.alert('Confirm','Disband this group?',[
        {text:'Cancel',style:'cancel'},
        {text:'Disband',style:'destructive',onPress:doDisband}
      ]);
    }
  };

  if(loading){
    return <View style={[styles.container,{justifyContent:'center',alignItems:'center'}]}>
      <ActivityIndicator size="large" color="#3162F4"/></View>;
  }
  const memberCnt = group.memberCount ?? group.members?.length ?? 0;

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
        <Text style={styles.text}>Visibility: {group.public ? 'Public':'Private'}</Text>
        <Text style={styles.text}>Auto Admission: {group.autoAdmission ? 'Yes':'No'}</Text>
        <Text style={styles.text}>Members: {memberCnt}</Text>
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
        <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
        <Text style={styles.btnText}>Message Group</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={()=> navigation.navigate('RequestManagement',{
          groupId: group.id
        })}>
        <MaterialIcons name="person-add-alt-1" size={20} color="#fff"/>
        <Text style={styles.btnText}>Manage Join Requests</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={()=>navigation.navigate('GroupMemberListMain',{
          groupId: group.id,
          group  : { name: group.name, hashtag: group.hashtag }
        })}>
        <AntDesign name="team" size={20} color="#fff"/>
        <Text style={styles.btnText}>View Member List</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={openEdit}>
        <AntDesign name="edit" size={20} color="#fff"/>
        <Text style={styles.btnText}>Edit Group</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.disbandBtn} onPress={disband}>
        <AntDesign name="delete" size={20} color="#fff"/>
        <Text style={styles.btnText}>Disband Group</Text>
      </TouchableOpacity>

      <Modal transparent animationType="fade" visible={editVisible}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <ScrollView>
              <Text style={styles.modalTitle}>Edit Group</Text>
              <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName}/>
              <TextInput style={styles.input} placeholder="Hashtag" value={tag} onChangeText={setTag}/>
              <TextInput
                style={[styles.input,{height:80}]}
                multiline placeholder="Description"
                value={desc} onChangeText={setDesc}/>
              <View style={styles.switchRow}>
                <Text style={styles.text}>Public:</Text><Switch value={pub}  onValueChange={setPub}/>
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.text}>Auto Admission:</Text><Switch value={auto} onValueChange={setAuto}/>
              </View>
              <TouchableOpacity
                style={[styles.saveBtn,{opacity:saving?0.6:1}]}
                disabled={saving}
                onPress={save}>
                <Text style={styles.btnText}>{saving?'Saving…':'Save Changes'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={()=>setEditVisible(false)}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#f9f9f9',padding:20},
  headerRow:{flexDirection:'row',alignItems:'center',marginBottom:15},
  header:{fontSize:20,fontWeight:'bold',marginLeft:12,color:'#3162F4'},

  card:{backgroundColor:'#333',borderRadius:12,padding:16,marginBottom:20},
  title:{fontSize:18,fontWeight:'bold',color:'#fff',marginBottom:10},
  text:{fontSize:14,color:'#ccc',marginBottom:6},

  button:{backgroundColor:'#3162F4',flexDirection:'row',alignItems:'center',
          padding:12,borderRadius:10,marginBottom:12,justifyContent:'center',gap:8},
  disbandBtn:{backgroundColor:'#f44336',flexDirection:'row',alignItems:'center',
              padding:12,borderRadius:10,marginTop:20,justifyContent:'center',gap:8},
  btnText:{color:'#fff',fontWeight:'bold'},

  overlay:{flex:1,backgroundColor:'rgba(0,0,0,0.4)',justifyContent:'center',alignItems:'center'},
  modal:{backgroundColor:'#fff',borderRadius:10,padding:20,width:'85%',maxHeight:'80%'},
  modalTitle:{fontSize:18,fontWeight:'bold',marginBottom:12,color:'#3162F4'},
  input:{borderColor:'#ccc',borderWidth:1,padding:10,borderRadius:8,marginBottom:12,fontSize:14},
  switchRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16},
  saveBtn:{backgroundColor:'#4CAF50',padding:12,borderRadius:8,alignItems:'center',marginBottom:10},
  cancelBtn:{backgroundColor:'#888',padding:10,borderRadius:8,alignItems:'center'}
});

export default GroupDetailsPageMainActor;