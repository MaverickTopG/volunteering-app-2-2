import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AnimalTabNavigator from '../volcarosuel/Navigators/AnimalTabNavigator';
import CustomSideBarMenu from './CustomSideBarMenu';
import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet, StatusBar } from 'react-native';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
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
          // Disable swipe gestures for the drawer
          swipeEnabled: false,
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
            // Hide the hamburger icon by rendering nothing for headerLeft
            headerLeft: () => null,
          }}
        />
      </Drawer.Navigator>
    </View>
  );
};

export default DrawerNavigator;
