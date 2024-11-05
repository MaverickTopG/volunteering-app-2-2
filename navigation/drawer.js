import React, { useContext } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomSideBarMenu from './CustomSideBarMenu';
import AnimalTabNavigator from '../volcarosuel/tab/AnimalTabNavigator.js';
import VolunteerLogs from '../volcarosuel/volunteer_log.js';
import LoginScreen from '../auth/LoginScreen';
import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet, StatusBar } from 'react-native';
import { AuthContext } from '../auth/AuthContext';
import { useNavigation } from '@react-navigation/native';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const { user } = useContext(AuthContext);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#000000" />
      <Drawer.Navigator
        drawerContent={(props) => <CustomSideBarMenu {...props} />}
        screenOptions={{
          headerBackground: () => (
            <LinearGradient colors={['#fff6e7', '#fff6e7']} style={StyleSheet.absoluteFill} />
          ),
          headerTintColor: '#333333',
          headerTitleStyle: {
            color: '#fff6e7',
          },
          headerStyle: {
            backgroundColor: 'transparent',
          },
        }}
      >
        <Drawer.Screen
          name="NexoLink"
          component={AnimalTabNavigator}
          options={{
            drawerLabel: 'NexoLink',
            headerTitle: 'NexoLink',
            headerTitleStyle: { color: '#333333' },
            headerStyle: { backgroundColor: 'black' },
          }}
        />
        <Drawer.Screen
          name="VolunteerLogs"
          component={user ? VolunteerLogs : LoginScreen}
          options={{
            drawerLabel: 'Volunteer Logs',
            headerTitle: 'Volunteer Logs',
            headerTitleStyle: { color: '#fff6e7' },
            headerStyle: { backgroundColor: 'black' },
          }}
        />
      </Drawer.Navigator>
    </View>
  );
};

export default DrawerNavigator;
