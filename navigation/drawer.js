// navigation/drawer.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomSideBarMenu from '../screens/CustomSideBarMenu';
import TStackNavigator from '../A&WNav/stack';
import VStackNavigator from '../C&FNav/stack.js';
import EStackNavigator from '../TechNav/stack.js';
import LStackNavigator from '../LibraryNav/stack.js';
import StackNavigator from './stack';
import Logout from '../screens/logout';
import VolcarosuelStack from '../volcarosuel/VolcarosuelStack'; // Import VolcarosuelStack

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomSideBarMenu {...props} />}
      screenOptions={{ headerShown: true }}>
      <Drawer.Screen name="Animal & Wildlife" component={TStackNavigator} />
      <Drawer.Screen name="Children and Family" component={VStackNavigator} />
      <Drawer.Screen name="Working with Seniors" component={StackNavigator} />
      <Drawer.Screen name="Environment" component={EStackNavigator} />
      <Drawer.Screen name="Library Services" component={LStackNavigator} />
      <Drawer.Screen name="Logout" component={Logout} />
      <Drawer.Screen name="Volunteer" component={VolcarosuelStack} /> {/* Update to use VolcarosuelStack */}
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
