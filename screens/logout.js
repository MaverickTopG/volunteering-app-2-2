import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../screens/styles';
import { useAuth } from '../screens/AuthContext';

const Logout = ({ navigation }) => {
  const { signOutUser } = useAuth();

  const handleLogout = () => {
    signOutUser()
      .then(() => {
        navigation.navigate('login');
      })
      .catch((error) => {
        console.error('Error signing out: ', error);
      });
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
