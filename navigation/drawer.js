import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AnimalTabNavigator from '../volcarosuel/Navigators/AnimalTabNavigator';
import CustomSideBarMenu from './CustomSideBarMenu';
import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet, StatusBar, Dimensions } from 'react-native';
import OrganizationScreen from '../volcarosuel/screens/OrganizationScreen';
import AccountScreen from '../volcarosuel/screens/AccountScreen';

const Drawer = createDrawerNavigator();

// Example baseline (iPhone 16 Pro Max)
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width } = Dimensions.get('window');
const scale = (size) => (width / guidelineBaseWidth) * size;

const DrawerNavigator = () => {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#000000" />
      <Drawer.Navigator
        drawerContent={(props) => <CustomSideBarMenu {...props} />}
        screenOptions={{
          // Make the drawer slide over the content rather than push it
          drawerType: 'front',

          // Dark semi-transparent overlay behind the drawer
          overlayColor: 'rgba(0,0,0,0.5)',

          // Drawer background is transparent so the app screen remains visible behind
          drawerStyle: {
            backgroundColor: 'transparent',
            width: scale(280), // Adjust drawer width as desired
          },

          // Keep the main scene background transparent behind the drawer
          sceneContainerStyle: {
            backgroundColor: 'transparent',
          },

          headerBackground: () => (
            <LinearGradient
              colors={['#fff6e7', '#fff6e7']}
              style={StyleSheet.absoluteFill}
            />
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
            drawerLabel: 'Add an Org',
          }}
        />
        <Drawer.Screen
          name="Account"
          component={AccountScreen}
          options={{
            drawerLabel: 'Account',
          }}
        />
      </Drawer.Navigator>
    </View>
  );
};

export default DrawerNavigator;
