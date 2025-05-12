import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from './src/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { getDoc, doc } from 'firebase/firestore';

// Import all screens
import LoginScreen from './src/screens/login';
import RegisterScreen from './src/screens/registration';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import GroupScreen from './src/screens/GroupScreen';
import ManageRolesScreen from './src/screens/ManageRolesScreen';
import AvailabilityScreen from './src/screens/AvailabilityScreen';
import AdminNotificationsScreen from './src/screens/AdminNotificationsScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Group') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Manage Roles') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'Availability') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#28a745',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }} 
      />
      <Tab.Screen 
        name="Group" 
        component={GroupScreen} 
        options={{ title: 'Groups' }} 
      />
      <Tab.Screen 
        name="Manage Roles" 
        component={ManageRolesScreen} 
        options={{ title: 'Manage' }} 
      />
      <Tab.Screen 
        name="Availability" 
        component={AvailabilityScreen} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } else {
        setUserData(null);
      }

      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            {/* Check if user is admin and show appropriate screens */}
            {userData?.role === 'admin' ? (
              <Stack.Screen 
                name="AdminHome" 
                component={AdminNotificationsScreen}
                options={{ headerShown: false }}
              />
            ) : (
              <Stack.Screen 
                name="AppTabs" 
                component={HomeTabs}
                options={{ headerShown: false }}
              />
            )}
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen}
              options={{ title: 'Edit Profile' }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{ title: 'Settings' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="ForgotPassword" 
              component={ForgotPasswordScreen}
              options={{ title: 'Reset Password' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});