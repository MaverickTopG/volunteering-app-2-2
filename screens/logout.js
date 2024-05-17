import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../screens/styles';
import { useAuth } from '../screens/AuthContext.js';

const Logout = ({ navigation }) => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigation.replace('Login'); // Ensures user can't go back after logging out
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
