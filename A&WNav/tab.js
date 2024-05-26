import React, { useEffect } from 'react';
import { Keyboard, StyleSheet } from 'react-native';
import AIStory from '../screens/AIStory';
import Feed from '../screens/Feed';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { RFValue } from 'react-native-responsive-fontsize';
import firebase from '../screens/firebase'; // Ensure the correct import path to your firebase.js

const Tab = createMaterialBottomTabNavigator();

const BottomTab = () => {
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', () => {
      console.log('Keyboard will show');
    });

    const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () => {
      console.log('Keyboard will hide');
    });

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      console.log('Keyboard did show');
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      console.log('Keyboard did hide');
    });

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName = '';
          if (route.name === 'Working with Seniors') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Ordix') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          }
          return <Ionicons name={iconName} size={RFValue(25)} color={color} />;
        },
      })}
      activeColor={'#ee8249'}
      inactiveColor={'teal'}
      barStyle={styles.bottomTabStyle}
    >
      <Tab.Screen name="Working with Seniors" component={Feed} />
      <Tab.Screen name="Ordix" component={AIStory} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  bottomTabStyle: {
    backgroundColor: 'white',
    height: 70, // Ensure height is a number
    borderRadius: 15,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    elevation: 0,
    shadowColor: '#7F5DF0',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.5,
  },
});

export default BottomTab;
