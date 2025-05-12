import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ScrollView, Switch, ActivityIndicator, Image 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Ionicons } from '@expo/vector-icons';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [degree, setDegree] = useState(''); 
  const [isTeacher, setIsTeacher] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTeacherToggle = (value) => {
    setIsTeacher(value);
    if (value) setIsStudent(false);
  };

  const handleStudentToggle = (value) => {
    setIsStudent(value);
    if (value) setIsTeacher(false);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Camera roll access is needed to upload an image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImageAsync = async (uri, uid) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storage = getStorage();
    const imageRef = ref(storage, `profileImages/${uid}`);
    await uploadBytes(imageRef, blob);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  };

  const handleRegister = async () => {
    if (!email || !password || !name || !degree || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (!isTeacher && !isStudent) {
      Alert.alert('Error', 'Please select a role (Teacher or Student)');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password should be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let photoURL = '';
      if (image) {
        photoURL = await uploadImageAsync(image, user.uid);
      }

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        degree,
        role: isTeacher ? 'teacher' : 'student',
        verified: false,
        createdAt: serverTimestamp(),
        uid: user.uid,
        photoURL,
      });

      Alert.alert(
        'Success', 
        'Account created successfully! Awaiting admin verification.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = error.message || 'An unknown error occurred';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email already in use';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection';
          break;
      }

      Alert.alert('Registration Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.profileImage} />
        ) : (
          <Ionicons name="person-circle" size={100} color="#888" />
        )}
        <Text style={styles.imageText}>Upload Profile Picture</Text>
      </TouchableOpacity>

      <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Degree" value={degree} onChangeText={setDegree} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

      <View style={styles.roleContainer}>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>I am a Teacher</Text>
          <Switch value={isTeacher} onValueChange={handleTeacherToggle} />
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>I am a Student</Text>
          <Switch value={isStudent} onValueChange={handleStudentToggle} />
        </View>
      </View>

      <TouchableOpacity style={styles.smallButton} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Login here</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  smallButton: {
    height: 45,
    width: 150,
    alignSelf: 'center',
    borderRadius: 8,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    padding: 10,
  },
  linkText: {
    color: '#007bff',
    textAlign: 'center',
  },
  roleContainer: {
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  switchLabel: {
    fontSize: 16,
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  imageText: {
    color: '#555',
  },
});

export default RegisterScreen;
