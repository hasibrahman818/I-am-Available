import React, { useState } from 'react';
import {  View,  Text,  TextInput,  Switch,  TouchableOpacity,  StyleSheet,  Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import currentUser from '../assets/data/currentUser.json';
import { AntDesign } from '@expo/vector-icons';

const AvailabilityAddPage = () => {
  const [date, setDate] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [location, setLocation] = useState('');
  const [group, setGroup] = useState('');
  const [recurring, setRecurring] = useState(false);

  const handleSubmit = async () => {
    if (!date || !timeStart || !timeEnd || !location || !group) {
      Alert.alert('Incomplete', 'Please fill in all fields');
      return;
    }

    const newAvailability = {
      id: Date.now().toString(),
      name: currentUser.name,
      date,
      timeStart,
      timeEnd,
      location,
      group,
      recurring,
    };

    try {
      const existing = await AsyncStorage.getItem('availabilities');
      const availList = existing ? JSON.parse(existing) : [];

      const updatedList = [...availList, newAvailability];

      await AsyncStorage.setItem('availabilities', JSON.stringify(updatedList));

      Alert.alert('Success', 'Availability created and saved!');
      console.log('Saved availability:', newAvailability);

      // 清空输入框
      setDate('');
      setTimeStart('');
      setTimeEnd('');
      setLocation('');
      setGroup('');
      setRecurring(false);
    } catch (error) {
      console.error('Save failed:', error);
      Alert.alert('Error', 'Failed to save availability');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            alert('Go back to management page');
            console.log('Go back to management page');
          }}
        >
          <AntDesign name="stepbackward" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Add New Availability</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Start Time (e.g. 09:00)"
        value={timeStart}
        onChangeText={setTimeStart}
      />
      <TextInput
        style={styles.input}
        placeholder="End Time (e.g. 11:00)"
        value={timeEnd}
        onChangeText={setTimeEnd}
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />
      <TextInput
        style={styles.input}
        placeholder="Group (e.g. XX-2024/25)"
        value={group}
        onChangeText={setGroup}
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Recurring Weekly:</Text>
        <Switch value={recurring} onValueChange={setRecurring} />
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2e9f3',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3162F4',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 12,
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
  },
  submitBtn: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AvailabilityAddPage;
