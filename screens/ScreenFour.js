
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const NotificationsPage = ({ navigation }) => {
    const [searchText, setSearchText] = useState('');
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'availability',
            title: 'Availability Alert',
            message: 'Professor Luis Cos is available now',
            color: '#facc15',
        },
        {
            id: 2,
            type: 'group',
            title: 'Group Request',
            message: 'Student Gonçalo Almeida requested to join CG-Students-2023/24',
            color: '#4ade80',
        },
        {
            id: 3,
            type: 'chat',
            title: 'New Message',
            message: "Professor Joana Oliveira",
            color: '#60a5fa',
            goToChat: true,
        }
    ]);

    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const filteredNotifications = notifications.filter(notification =>
        notification.title.toLowerCase().includes(searchText.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchText.toLowerCase())
    );

    const renderNotification = ({ item }) => (
        <TouchableOpacity
            style={[styles.notificationBox, { backgroundColor: item.color }]}
            activeOpacity={item.goToChat ? 0.7 : 1}
            onPress={() => {
                if(item.type === 'chat'){
                    navigation.goBack();
                } else if(item.type === 'availability'){
                    console.log('redirecting to Dashboard');
                } else if(item.type === 'group'){
                    console.log('redirecting to Requesting management');
                }
            }}>
            <Icon name="information-circle-outline" size={20} color="#fff"/>
            <View style={{ flex: 1 }}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationMessage}>{item.message}</Text>
            </View>
            <TouchableOpacity onPress={() => removeNotification(item.id)}>
                <Icon name="close" size={18} color="#fff"/>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back-outline" size={24} color="#4a4a4a"/>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
            </View>
            <View style={styles.searchContainer}>
                <Icon name="search-outline" size={20} color="#666"/>
                <TextInput
                    placeholder="Search notifications"
                    style={styles.searchInput}
                    placeholderTextColor="#666"
                    value={searchText}
                    onChangeText={setSearchText}/>
            </View>
            <FlatList
                data={filteredNotifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No notifications found</Text>
                }
                contentContainerStyle={styles.listContent}/>
        </View>
    );
};

export default NotificationsPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#d6c8c5',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    headerTitle: {
        backgroundColor: '#0a66ff',
        color: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        fontSize: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: '#000',
    },
    notificationBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        gap: 10,
    },
    notificationTitle: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
});