import React from 'react';
import { View, TouchableOpacity, Text, StatusBar, StyleSheet } from 'react-native';
import { auth } from '../screens/config.js';  // Ensure this path is correct
import { signOut } from 'firebase/auth';
import { RFValue } from 'react-native-responsive-fontsize';

export default function Logout({ navigation }) {
  const handleLogout = () => {
    signOut(auth)
      .then(() => navigation.replace('Login'))
      .catch(error => alert(error.message));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#15193c" />
      <Text style={styles.title}>Logout</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles integrated within the same file
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#15193c',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    width: '100%',
    padding: RFValue(15),
    backgroundColor: '#0077B6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: RFValue(20),
  },
  title: {
    fontSize: RFValue(24),
    color: 'white',
    marginBottom: 20,
  },
});
