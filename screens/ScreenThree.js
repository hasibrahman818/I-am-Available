
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ErrorPage = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Icon name="alert-circle" size={80} color="#8B0000"/>
            <Text style={styles.errorText}>ERROR</Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('ChatPage')}>
                <Text style={styles.buttonText}>Return to the Chat List page</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ErrorPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#8B0000',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#0a66ff',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});