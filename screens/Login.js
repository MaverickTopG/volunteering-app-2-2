import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, Keyboard } from 'react-native';
import styles from '../screens/styles';
import { useAuth } from '../screens/AuthContext.js';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      console.log('Keyboard shown');
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      console.log('Keyboard hidden');
    });

    // Cleanup function to remove listeners
    return () => {
      if (keyboardDidShowListener) keyboardDidShowListener.remove();
      if (keyboardDidHideListener) keyboardDidHideListener.remove();
    };
  }, []);

  const handleLogin = () => {
    signIn(email, password);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Volunteer App</Text>
      <TextInput
        style={styles.input}
        onChangeText={setEmail}
        value={email}
        placeholder="Email"
        placeholderTextColor="#ccc"
      />
      <TextInput
        style={styles.input}
        onChangeText={setPassword}
        value={password}
        secureTextEntry
        placeholder="Password"
        placeholderTextColor="#ccc"
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <Text style={styles.footerText}>
        If you don't have an account please contact your system administrator.
      </Text>
    </View>
  );
};

export default Login;
