import React from 'react';
import AIStory from '../screens/AIStory';
import Feed from '../screens/Feed';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { View, StyleSheet, Keyboard } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import firebase from '../screens/firebase'; // Ensure the correct import path to your firebase.js

const Tab = createMaterialBottomTabNavigator();

export default class BottomTab extends React.Component {
  constructor() {
    super();
    this.state = {
      isEnabled: false,
      light_theme: true,
    };
  }

  async fetchUser() {
    let theme, name;
    await firebase
      .database()
      .ref('/users/' + firebase.auth().currentUser.uid)
      .on('value', function (snapshot) {
        theme = snapshot.val().current_theme;
        name = `${snapshot.val().first_name}`;
      });
    this.setState({
      light_theme: theme === 'light' ? true : false,
      isEnabled: theme === 'light' ? false : true,
      name: name,
    });
  }

  componentDidMount() {
    this.fetchUser();

    // Add keyboard listeners
    this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', () => {
      console.log('Keyboard shown');
    });

    this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () => {
      console.log('Keyboard hidden');
    });

    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      console.log('Keyboard shown');
    });

    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      console.log('Keyboard hidden');
    });
  }

  componentWillUnmount() {
    // Remove keyboard listeners
    if (this.keyboardWillShowListener) this.keyboardWillShowListener.remove();
    if (this.keyboardWillHideListener) this.keyboardWillHideListener.remove();
    if (this.keyboardDidShowListener) this.keyboardDidShowListener.remove();
    if (this.keyboardDidHideListener) this.keyboardDidHideListener.remove();
  }

  render() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Enviroment') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Ordix') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            }
            return <Ionicons name={iconName} size={RFValue(25)} color={color} />;
          },
        })}
        activeColor={'#ee8249'}
        inactiveColor={'teal'}
        barStyle={this.state.light_theme ? styles.lightbottomTabStyle : styles.bottomTabStyle}
      >
        <Tab.Screen name="Working with Seniors" component={Feed} />
        <Tab.Screen name="Ordix" component={AIStory} />
      </Tab.Navigator>
    );
  }
}

const styles = StyleSheet.create({
  bottomTabStyle: {
    backgroundColor: 'white',
    height: '10%',
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
  lightbottomTabStyle: {
    backgroundColor: 'white',
    height: '10%',
    borderRadius: 15,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    elevation: 0,
    height: 70,
    shadowColor: '#7F5DF0',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
});
