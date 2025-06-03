import React, { useState, useEffect } from 'react';
import {  View,  Text,  TextInput,  Switch,  StyleSheet,  TouchableOpacity,  Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockAvailability = {
  id: 'mock123',
  name: 'Professor AAA',
  date: '2025-04-20',
  timeStart: '09:00',
  timeEnd: '11:00',
  location: 'Room 203',
  group: 'XX-2024/25',
  recurring: true,
};

const AvailabilityEditPage = () => {
  const availability = mockAvailability;

  const [date, setDate] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [location, setLocation] = useState('');
  const [group, setGroup] = useState('');
  const [recurring, setRecurring] = useState(false);

  useEffect(() => {
    if (availability) {
      setDate(availability.date);
      setTimeStart(availability.timeStart);
      setTimeEnd(availability.timeEnd);
      setLocation(availability.location);
      setGroup(availability.group);
      setRecurring(availability.recurring);
    }
  }, [availability]);

  const handleUpdate = async () => {
    if (!date || !timeStart || !timeEnd || !location || !group) {
      Alert.alert('Incomplete', 'Please fill in all fields');
      return;
    }

    const updatedAvailability = {
      ...availability,
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

      const updatedList = availList.map(item =>
        item.id === updatedAvailability.id ? updatedAvailability : item
      );

      await AsyncStorage.setItem('availabilities', JSON.stringify(updatedList));
      Alert.alert('Success', 'Availability updated!');
      console.log('Updated:', updatedAvailability);
    } catch (err) {
      console.error('Failed to update:', err);
      Alert.alert('Error', 'Update failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Availability</Text>

      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Start Time"
        value={timeStart}
        onChangeText={setTimeStart}
      />
      <TextInput
        style={styles.input}
        placeholder="End Time"
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
        placeholder="Group"
        value={group}
        onChangeText={setGroup}
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Recurring Weekly:</Text>
        <Switch value={recurring} onValueChange={setRecurring} />
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleUpdate}>
        <Text style={styles.submitText}>Update</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2e9f3', padding: 20 },
  header: {
    fontSize: 20,
    backgroundColor: '#3162F4',
    color: 'white',
    textAlign: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
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
    backgroundColor: '#2196F3',
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

export default AvailabilityEditPage;
