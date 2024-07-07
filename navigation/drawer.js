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
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, StyleSheet, StatusBar } from 'react-native';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Drawer.Navigator
        drawerContent={props => <CustomSideBarMenu {...props} />}
        screenOptions={({ navigation, route }) => ({
          headerBackground: () => (
            <LinearGradient
              colors={['#2A2A33', '#000']}
              style={StyleSheet.absoluteFill}
            />
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
    </View>
  );
};

export default DrawerNavigator;

const styles = StyleSheet.create({
  headerBackground: {
    flex: 1,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    paddingLeft: 10,
  },
  profileIcon: {
    paddingRight: 10,
  },
  headerTitle: {
    color: '#fff6e7',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
});
