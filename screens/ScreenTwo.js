
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { db, auth } from '../src/firestore/firebase.config';
import { collection, addDoc, query, onSnapshot, orderBy } from 'firebase/firestore';

const ChatScreen = ({ route, navigation }) => {
    const { name = 'User', id, type } = route.params || {};
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const flatListRef = useRef(null);
    
    useEffect(() => {
        if (!id || !type) return;
        
        const messagesRef = collection(db, type, id, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()
            }));
            setMessages(messagesData);
        });
        return () => unsubscribe();
    }, [id, type]);

    const handleSend = async () => {
        if(inputText.trim() === '' || !id || !type) return;
        
        const newMessage = {
            text: inputText,
            uid : auth.currentUser.uid,
            name: auth.currentUser.displayName ?? auth.currentUser.email ?? 'Me',
            timestamp: new Date(),
            time: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            })
        };
        
        try {
            const messagesRef = collection(db, type, id, 'messages');
            await addDoc(messagesRef, newMessage);
            setInputText('');
        } catch (error) {
            console.log("Error: " + error);
        }
    };

    const renderMessage = ({ item }) => {
        const isMe = item.uid === auth.currentUser.uid;
        return (
        <View style={styles.messageRow}>
            <View style={[
                styles.messageBubble,
                item.uid === auth.currentUser.uid ? styles.myMessage : styles.otherMessage]}>
                <Text style={styles.senderName}>{isMe ? 'Me' : item.name}</Text>
                <Text style={styles.messageText}>{item.text}</Text>
                <Text style={styles.timeText}>{item.time}</Text>
            </View>
        </View>
    );
    };
    return(
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={80}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back-outline" size={28} color="#4a4a4a"/>
                </TouchableOpacity>
                <View style={styles.nameBox}>
                    <Text style={styles.chatName}>{name}</Text>
                    <View style={styles.statusRow}>
                        <View style={styles.greenDot} />
                        <Text style={styles.statusText}>Available</Text>
                    </View>
                </View>
            </View>
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesContainer}
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() => {
                    if (messages.length > 0) {
                        flatListRef.current.scrollToEnd({ animated: true });
                    }
                }}
                onLayout={() => {
                    if (messages.length > 0) {
                        flatListRef.current.scrollToEnd({ animated: true });
                    }
                }}/>
            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    placeholder="Type a message..."
                    value={inputText}
                    onChangeText={setInputText}/>
                <TouchableOpacity onPress={handleSend}>
                    <Icon name="send" size={24} color="#7d5fff"/>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default ChatScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: '#d6c8c5' 
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#d6c8c5',
    },
    nameBox: {
        flex: 1,
        marginLeft: 15,
        backgroundColor: '#968686',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    chatName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 2,
    },
    statusRow: { 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    greenDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'limegreen',
        marginRight: 5,
    },
    statusText: { 
        fontSize: 12, 
        color: '#fff' 
    },
    messagesContainer: { 
        padding: 15, 
        paddingBottom: 30 
    },
    messageRow: { 
        marginBottom: 15 
    },
    messageBubble: {
        borderRadius: 10,
        padding: 10,
        maxWidth: '80%',
    },
    myMessage: {
        backgroundColor: '#3b3b3b',
        alignSelf: 'flex-end',
    },
    otherMessage: {
        backgroundColor: '#888',
        alignSelf: 'flex-start',
    },
    messageText: { color: '#fff' },
    timeText: {
        color: '#ccc',
        fontSize: 10,
        textAlign: 'right',
        marginTop: 4,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 10,
        margin: 15,
        borderRadius: 25,
    },
    input: {
        flex: 1,
        marginRight: 10,
        color: '#4a4a4a',
    },
});
