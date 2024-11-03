import React, { useContext } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomSideBarMenu from './CustomSideBarMenu';
import AnimalTabNavigator from '../volcarosuel/tab/AnimalTabNavigator.js';
import VolunteerLogs from '../volcarosuel/volunteer_log.js';
import LoginScreen from '../auth/LoginScreen'; // Ensure correct path to LoginScreen
import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet, StatusBar } from 'react-native';
import { AuthContext } from '../auth/AuthContext'; // Adjust path to AuthContext
import { useNavigation } from '@react-navigation/native';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const { user } = useContext(AuthContext); // Get user state from AuthContext
  const navigation = useNavigation();

  const handleVolunteerLogsPress = () => {
    if (!user) {
      // If the user is not authenticated, navigate to the Login screen
      navigation.navigate('Login');
    } else {
      // If authenticated, navigate to VolunteerLogs
      navigation.navigate('VolunteerLogs');
    }
  };

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
          component={user ? VolunteerLogs : LoginScreen} // Conditionally render VolunteerLogs or LoginScreen
          listeners={{
            drawerItemPress: (e) => {
              if (!user) {
                // Prevent default action of opening the screen
                e.preventDefault();
                // Navigate to Login screen instead
                navigation.navigate('Login');
              }
            },
          }}
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
