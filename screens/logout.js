// Logout.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../screens/styles';
import { useAuth } from '../screens/AuthContext';

const Logout = ({ navigation }) => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigation.replace('Login'); // Ensure this screen name matches the name in your navigator
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Logout;
