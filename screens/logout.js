import React from 'react';
import { View, Text } from 'react-native';
import firebase from 'firebase/auth';

export default class Logout extends React.Component {
  componentDidMount() {
    firebase.auth().signOut();
    this.props.navigation.navigate('login')
  }
  render() {
    return (
      <View>
        <Text> Logout Screen </Text>
      </View>
    )
  }
}