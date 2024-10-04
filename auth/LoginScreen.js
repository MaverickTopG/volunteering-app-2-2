// LoginScreen.js
import React, { useState, useContext } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../supabaseClient'; // Adjust the path accordingly
import { AuthContext } from './AuthContext'; // Adjust the path accordingly

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AuthContext);

  const handleLogin = async () => {
    const { error, user } = await supabase.auth.signIn({ email, password });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setUser(user);
      navigation.navigate('NexoLink'); // Navigate to your main app screen
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} color="#fff6e7" />
      <Button
        title="Don't have an account? Register"
        onPress={() => navigation.navigate('Register')}
        color="#fff6e7"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#000' },
  input: {
    height: 40,
    borderColor: '#fff6e7',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    color: '#fff6e7',
    backgroundColor: '#1a1a1a',
  },
});

export default LoginScreen;
