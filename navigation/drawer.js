// navigation/drawer.js
import React, { useContext } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomSideBarMenu from './CustomSideBarMenu';
import AnimalTabNavigator from '../volcarosuel/tab/AnimalTabNavigator.js';
import VolunteerLogs from '../volcarosuel/volunteer_log.js';
import LoginScreen from '../auth/LoginScreen.js'; // We'll create this screen
import RegisterScreen from '../auth/RegisterScreen.js'; // We'll create this screen
import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet, StatusBar } from 'react-native';
import { AuthContext } from '../auth/AuthContext.js'; // Adjust the path

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const { user } = useContext(AuthContext);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Drawer.Navigator
        drawerContent={(props) => <CustomSideBarMenu {...props} />}
        screenOptions={({ navigation, route }) => ({
          headerBackground: () => (
            <LinearGradient colors={['#2A2A33', '#000']} style={StyleSheet.absoluteFill} />
          ),
          headerTintColor: '#fff6e7',
          headerTitleStyle: {
            color: '#fff6e7',
          },
          headerStyle: {
            backgroundColor: 'transparent',
          },
        })}
      >
        {user ? (
          // Screens for authenticated users
          <>
            <Drawer.Screen
              name="NexoLink"
              component={AnimalTabNavigator}
              options={{
                headerTitle: 'NexoLink',
                headerTitleStyle: { color: '#fff6e7' },
                headerStyle: { backgroundColor: 'black' },
              }}
            />
            <Drawer.Screen
              name="VolunteerLogs"
              component={VolunteerLogs}
              options={{
                headerTitle: 'Volunteer Logs',
                headerTitleStyle: { color: '#fff6e7' },
                headerStyle: { backgroundColor: 'black' },
              }}
            />
          </>
        ) : (
          // Screens for unauthenticated users
          <>
            <Drawer.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerTitle: 'Login',
                headerTitleStyle: { color: '#fff6e7' },
                headerStyle: { backgroundColor: 'black' },
              }}
            />
            <Drawer.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                headerTitle: 'Register',
                headerTitleStyle: { color: '#fff6e7' },
                headerStyle: { backgroundColor: 'black' },
              }}
            />
          </>
        )}
      </Drawer.Navigator>
    </View>
  );
};

export default DrawerNavigator;
