import React from 'react';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

import DashboardScreen from './page/dashboard';
/* import ProfileScreen from './page/ProfileScreen';
import GroupScreen from './page/GroupScreen';
*/
import AvailabilityPage from './page/AvailabilityPage';
import AvailabilityManagementPage from './page/AvailabilityManagementPage';
import AvailabilityAddPage from './page/AvailabilityAddPage';
import AvailabilityEditPage from './page/AvailabilityEditPage';
import GroupListPage from './page/GroupListPage';
import GroupDetailsPageMainActor from './page/GroupDetailsPageMainActor';
import GroupDetailsPageSecActor from './page/GroupDetailsPageSecActor';
import GroupSearchPage from './page/GroupSearchPage';
import JoinRequestManagementPage from './page/JoinRequestManagementPage';
import GroupMemberListMainActor from './page/GroupMemberListMainActor';
import GroupMemberListSecActor from './page/GroupMemberListSecActor';
import GroupMemberListCreatePage from './page/GroupMemberListCreatePage';
export default function App() {
  return (
    <GroupMemberListCreatePage/>

  );
}
