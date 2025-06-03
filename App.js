import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from './src/firestore/firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';

import LoginScreen          from './screens/Login';
import RegisterScreen       from './screens/Registration';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';

import DashboardScreen      from './page/Dashboard/dashboard';
import GroupListPage             from './page/Group/GroupListPage';
import GroupDetailsPageMainActor from './page/Group/GroupDetailsPageMainActor';
import GroupDetailsPageSecActor  from './page/Group/GroupDetailsPageSecActor';
import GroupMemberListMainActor  from './page/Group/GroupMemberListMainActor';
import GroupMemberListSecActor   from './page/Group/GroupMemberListSecActor';
import GroupMemberListCreatePage from './page/Group/GroupMemberListCreatePage';
import RequestManagementPage     from './page/Group/JoinRequestManagementPage';
import GroupSearchPage           from './page/Group/GroupSearchPage';
import AvailabilityPage           from './page/Availability/AvailabilityPage';
import AvailabilityManagementPage from './page/Availability/AvailabilityManagementPage';
import UserProfileScreen      from './page/UserProfile/UserProfileScreen';
import EditProfileScreen      from './page/UserProfile/EditProfileScreen';
import SettingsScreen         from './page/UserProfile/SettingsScreen';
import ManageRolesScreen      from './screens/ManageRolesScreen';
import HelpSupportScreen      from './screens/HelpSupportScreen';
import AboutScreen            from './screens/AboutScreen';
import AdminNotificationsScreen from './screens/AdminNotificationsScreen';
import ChatPage     from './screens/ScreenOne';   
import ChatScreen   from './screens/ScreenTwo';   
import ErrorPage    from './screens/ScreenThree'; 
import NotificationsPage from './screens/ScreenFour';

const RootStack    = createNativeStackNavigator();
const AuthStack    = createNativeStackNavigator();
const AdminStack   = createNativeStackNavigator();
const Tab          = createBottomTabNavigator();
const GroupStack   = createNativeStackNavigator();
const AvailStack   = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const ChatStack    = createNativeStackNavigator();

function AuthStackScreen() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login"         component={LoginScreen} />
      <AuthStack.Screen name="Register"      component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function GroupStackScreen() {
  return (
    <GroupStack.Navigator screenOptions={{ headerShown: false }}>
      <GroupStack.Screen name="GroupList"            component={GroupListPage} />
      <GroupStack.Screen name="GroupDetailsMain"     component={GroupDetailsPageMainActor} />
      <GroupStack.Screen name="GroupDetailsSec"      component={GroupDetailsPageSecActor} />
      <GroupStack.Screen name="GroupMemberListMain"  component={GroupMemberListMainActor}/>
      <GroupStack.Screen name="GroupMemberListSec"   component={GroupMemberListSecActor}/>
      <GroupStack.Screen name="GroupMemberListCreate" component={GroupMemberListCreatePage}/>
      <GroupStack.Screen name="RequestManagement"    component={RequestManagementPage}/>
      <GroupStack.Screen name="GroupSearch"          component={GroupSearchPage}/>
    </GroupStack.Navigator>
  );
}

function AvailStackScreen() {
  return (
    <AvailStack.Navigator screenOptions={{ headerShown: false }}>
      <AvailStack.Screen name="AvailabilityList"        component={AvailabilityPage} />
      <AvailStack.Screen name="AvailabilityManagementPage"  component={AvailabilityManagementPage} />
    </AvailStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="UserProfile" component={UserProfileScreen} options={{ headerShown:false }} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title:'Edit Profile' }} />
      <ProfileStack.Screen name="Settings"    component={SettingsScreen}    options={{ title:'Settings' }} />
      <ProfileStack.Screen name="ManageRoles" component={ManageRolesScreen} options={{ title:'Manage Roles' }}/>
      <ProfileStack.Screen name="Help"        component={HelpSupportScreen} options={{ title:'Help & Support' }}/>
      <ProfileStack.Screen name="About"       component={AboutScreen}       options={{ title:'About' }}/>
    </ProfileStack.Navigator>
  );
}

function ChatStackScreen() {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="ChatPage"    component={ChatPage} />
      <ChatStack.Screen name="GroupChat"   component={ChatScreen} />
      <ChatStack.Screen name="PrivateChat" component={ChatScreen} />
      <ChatStack.Screen name="Error"         component={ErrorPage} />
      <ChatStack.Screen name="Notifications" component={NotificationsPage} />
    </ChatStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon : ({ focused, color, size }) => {
          let iconName = 'home';
          switch (route.name) {
            case 'DashboardTab': iconName = focused ? 'home'         : 'home-outline';      break;
            case 'GroupTab'    : iconName = focused ? 'people'       : 'people-outline';    break;
            case 'ChatTab'     : iconName = focused ? 'chatbubbles'  : 'chatbubbles-outline'; break;
            case 'AvailTab'    : iconName = focused ? 'calendar'     : 'calendar-outline';  break;
            case 'ProfileTab'  : iconName = focused ? 'person'       : 'person-outline';    break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor  : '#28a745',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { paddingBottom: 5, height: 60 },
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardScreen}      options={{ title: 'Home' }} />
      <Tab.Screen name="GroupTab"     component={GroupStackScreen}     options={{ title: 'Groups' }} />
      <Tab.Screen name="ChatTab"      component={ChatStackScreen}      options={{ title: 'Chat' }} />
      <Tab.Screen name="AvailTab"     component={AvailStackScreen}     options={{ title: 'Availability' }} />
      <Tab.Screen name="ProfileTab"   component={ProfileStackScreen}   options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

function AdminStackScreen() {
  return (
    <AdminStack.Navigator>
      <AdminStack.Screen name="AdminHome" component={AdminNotificationsScreen} options={{ headerShown:false }} />
      <AdminStack.Screen name="MainTabs"  component={MainTabs}                 options={{ headerShown:false }} />
    </AdminStack.Navigator>
  );
}

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser]                 = useState(null);
  const [userData, setUserData]         = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, 'user', u.uid));
        if (snap.exists()) setUserData(snap.data());
      } else {
        setUserData(null);
      }
      setInitializing(false);
    });
    return unsub;
  }, []);

  if (initializing) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#3162F4" />
        <Text style={{ marginTop: 8 }}>Loading…</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!user
          ? <RootStack.Screen name="Auth"  component={AuthStackScreen} />
          : userData?.role === 'admin'
            ? <RootStack.Screen name="Admin" component={AdminStackScreen} />
            : <RootStack.Screen name="Main"  component={MainTabs} />
        }
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
