import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AnimalTabNavigator from '../volcarosuel/Navigators/AnimalTabNavigator';
import CustomSideBarMenu from './CustomSideBarMenu';
import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet, StatusBar } from 'react-native';
import OrganizationScreen from '../volcarosuel/screens/OrganizationScreen';
import AccountScreen from '../volcarosuel/screens/AccountScreen'

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
            color: '#333333',
          },
          headerStyle: {
            backgroundColor: 'transparent',
          },
          swipeEnabled: true,
        }}
      >
        <Drawer.Screen
          name="NexoLink"
          component={AnimalTabNavigator}
          options={{
            drawerLabel: 'Home',
            headerTitle: 'NexoLink',
          }}
        />
    
        <Drawer.Screen
          name="Organizations"
          component={OrganizationScreen}
          options={{
          }}
        />
        <Drawer.Screen
          name="Account"
          component={AccountScreen}
          options={{
          }}
        />
      </Drawer.Navigator>
    </View>
  );
};

export default DrawerNavigator;
