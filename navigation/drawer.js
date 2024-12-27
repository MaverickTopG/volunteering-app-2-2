import React, { useContext } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import CustomSideBarMenu from './CustomSideBarMenu';
import AnimalTabNavigator from '../volcarosuel/Navigators/AnimalTabNavigator';
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
      </Drawer.Navigator>
    </View>
  );
};

export default DrawerNavigator;
