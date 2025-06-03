
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { db, usersRef, groupsRef, auth } from '../src/firestore/firebase.config';
import { getDocs, doc, updateDoc, collection } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const ChatPage = ({ navigation }) => {
    const [chatList, setChatList] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const [usersSnapshot, groupsSnapshot] = await Promise.all([
                    getDocs(collection(db, 'user')),
                    getDocs(collection(db, 'group'))
                ]);

                const allUsers = usersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name || 'Unknown User',
                    role: doc.data().role || 'user',
                    ...doc.data()
                }));

                const students = allUsers.filter(u =>
                    Array.isArray(u.roles) &&
                    u.roles.some(r => r.toLowerCase() === 'student')
                );

                const professors = allUsers.filter(u =>
                    Array.isArray(u.roles) &&
                    u.roles.some(r => r.toLowerCase() === 'professor')
                );

                const allGroups = groupsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name || 'Unknown Group',
                    members: doc.data().members || [],
                    ...doc.data()
                }));


                const rawList = [
                ...allGroups.map(g => ({ ...g, type: 'group' })),
                ...students.map(u => ({ ...u, type: 'user' })),
                ...professors.map(u => ({ ...u, type: 'user' }))
                ];

                const seen = new Set();
                const combinedChats = rawList
                .filter(item => {
                    if (seen.has(item.id)) return false;
                    seen.add(item.id);
                    return true;
                })
                .map(item => ({
                    id: item.id,
                    name: item.name || 'Unknown',
                    hashtag: '#' + item.id,
                    favorite: item.favorite || false,
                    type: item.type
                }));


                const sortedChats = [
                    ...combinedChats.filter(chat => chat.favorite),
                    ...combinedChats.filter(chat => !chat.favorite)
                ];

                setChatList(sortedChats);
                setLoading(false);
            } catch(error) {
                console.log("Error: " + error);
            }
        };
        fetchChats();
    }, []);

    const toggleFavorite = async (index) => {
        const updatedList = [...chatList];
        const chat = updatedList[index];
        const newFavoriteStatus = !chat.favorite;
        updatedList[index].favorite = newFavoriteStatus;
    
        try {
            const docRef = doc(db, chat.type === 'group' ? 'group' : 'user', chat.id);
            await updateDoc(docRef, {
                favorite: newFavoriteStatus
            });

            const sortedList = [
                ...updatedList.filter(item => item.favorite),
                ...updatedList.filter(item => !item.favorite)
            ];
            setChatList(sortedList);
        } catch(error) {
            console.log("Error: " + error);
            updatedList[index].favorite = !newFavoriteStatus;
            setChatList([...updatedList]);
        }
    };

    const renderItem = ({ item, index }) => (
        <View style={styles.chatCard}>
            <View>
                <Text style={styles.chatName}>{item.name}</Text>
                <Text style={styles.chatHashtag}>{item.hashtag}</Text>
            </View>
            <View style={styles.iconContainer}>
                <TouchableOpacity onPress={() => navigation.navigate(
                    item.type === 'group' ? 'GroupChat' : 'PrivateChat',
                    { id: item.id, name: item.name, type: item.type })}
                >  
                    <Icon name="chatbubble-outline" size={20} color="#fff"/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleFavorite(index)} style={{ marginLeft: 15 }}>
                    <Icon name={item.favorite ? 'star' : 'star-outline'}
                        size={20}
                        color="#fff"/>
                </TouchableOpacity>
            </View>
        </View>
    );

    const filteredChats = chatList.filter(chat =>
        chat.name.toLowerCase().includes(searchText.toLowerCase()) ||
        chat.hashtag.toLowerCase().includes(searchText.toLowerCase())
    );

    if(loading){
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Loading chats...</Text>
            </View>
        );
    }

    return(
        <View style={styles.container}>
            <View style={styles.topRow}>
                <TouchableOpacity 
                    onPress={() => signOut(auth)}
                    style={{ marginLeft: 10 }}>
                    <Icon name="log-out-outline" size={24} color="#4a4a4a"/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Error')}>
                    <Icon name="arrow-back-outline" size={24} color="#4a4a4a"/>
                </TouchableOpacity>
                <Text style={styles.chatListButton}>Chat list</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Notifications')}
                    style={{ marginLeft: 'auto' }}>
                    <Icon name="notifications-outline" size={24} color="#4a4a4a"/>
                </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
                <Icon name="search-outline" size={20} color="#666"/>
                <TextInput
                    placeholder="Search Name or Hashtag"
                    style={styles.searchInput}
                    placeholderTextColor="#666"
                    underlineColorAndroid="transparent"
                    value={searchText}
                    onChangeText={setSearchText}/>
            </View>
            <FlatList
                data={filteredChats}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}/>
        </View>
    );
};

export default ChatPage;

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#d6c8c5', 
        padding: 20 
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 10,
    },
    chatListButton: {
        backgroundColor: '#0a66ff',
        color: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        fontSize: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 20,
    },
    searchInput: {
        marginLeft: 10,
        flex: 1,
        padding: 0,
    },
    chatCard: {
        backgroundColor: '#4a4a4a',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    chatName: {
        color: '#fff',
        fontSize: 16,
    },
    chatHashtag: {
        color: '#ccc',
    },
    iconContainer: {
        flexDirection: 'row',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#e0d6d5', 
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    fabIcon: {
        fontSize: 30,
        color: '#4a4a4a', 
        marginBottom: 2, 
    },
});
