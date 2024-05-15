import React from 'react';
import { View, TouchableOpacity, Text, StatusBar } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import { auth } from '../screens/config.js';
import { signOut } from 'firebase/auth';

export default function Logout({ navigation }) {
  const handleLogout = () => {
    signOut(auth)
      .then(() => navigation.replace('Login'))
      .catch(error => alert(error.message));
  };

  return (
    <View style={commonStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#15193c" />
      <Text style={commonStyles.title}>Logout</Text>
      <TouchableOpacity style={commonStyles.button} onPress={handleLogout}>
        <Text style={commonStyles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
