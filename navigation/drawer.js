import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomSideBarMenu from '../screens/CustomSideBarMenu';
import TStackNavigator from '../A&WNav/stack';
import VStackNavigator from '../C&FNav/stack.js';
import EStackNavigator from '../TechNav/stack.js';
import LStackNavigator from '../LibraryNav/stack.js';
import StackNavigator from './stack';
import Logout from '../screens/logout';
import AnimalTabNavigator from '../volcarosuel/tab/AnimalTabNavigator.js';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomSideBarMenu {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#2A2A33',
        },
        headerTintColor: '#fff6e7',
        headerTitleStyle: {
          color: '#fff6e7',
        },
      }}
    >
      <Drawer.Screen name="Animal & Wildlife" component={TStackNavigator} />
      <Drawer.Screen name="Children and Family" component={VStackNavigator} />
      <Drawer.Screen name="Working with Seniors" component={StackNavigator} />
      <Drawer.Screen name="Environment" component={EStackNavigator} />
      <Drawer.Screen name="Library Services" component={LStackNavigator} />
      <Drawer.Screen name="Logout" component={Logout} />
      <Drawer.Screen
        name="Animal Carousel"
        component={AnimalTabNavigator}
        options={{
          headerTitle: "Animal Carousel",
          headerTitleStyle: { color: '#fff6e7' },
          headerStyle: { backgroundColor: 'black' },
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
