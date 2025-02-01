import React, { useState, useContext } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { AuthContext } from './AuthContext'; // Adjust the path to your AuthContext
import { useNavigation } from '@react-navigation/native';


const DeleteScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { deleteAccount } = useContext(AuthContext); // Use the deleteAccount method from AuthContext
  const navigation = useNavigation(); // For navigating back to login

  const handleDeleteAccount = async () => {
    const success = await deleteAccount(email, password);
  };

  const handleNavigateToLogin = () => {
    navigation.navigate('Login'); // Navigate to the Login screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={styles.contentContainer}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Delete Account</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            keyboardAppearance="dark" 
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            keyboardAppearance="dark" 
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleDeleteAccount}>
            <Text style={styles.buttonText}>Delete Account</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNavigateToLogin}>
            <Text style={styles.loginText}>Cancel and go back to Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DeleteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7', // Matching the light cream color
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    marginTop: 20,
  },
  input: {
    height: 50,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 25, // Rounded input fields
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: '#fff6e7',
    color: 'black',
    marginBottom: 15,
  },
  button: {
    backgroundColor: 'red', // Red button to signify danger
    padding: 15,
    borderRadius: 25, // Rounded button
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff6e7', // Cream-colored text for consistency
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginText: {
    color: '#333',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
  },
});
