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
import { AuthContext } from './AuthContext'; // Adjust path to your AuthContext
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const DeleteScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { deleteAccount } = useContext(AuthContext); // Use deleteAccount from AuthContext
  const navigation = useNavigation();

  const handleDeleteAccount = async () => {
    try {
      const success = await deleteAccount(email, password);
      // You can add further logic (like navigation) based on success/failure if desired
    } catch (error) {
      console.error(error);
      Alert.alert('Delete Failed', 'Could not delete the account. Check credentials and try again.');
    }
  };

  const handleNavigateToLogin = () => {
    navigation.navigate('Login'); // Navigate to the Login screen
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
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
          {/* Email Field */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            keyboardAppearance="dark"
          />

          {/* Password with toggle icon */}
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              keyboardAppearance="dark"
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
              <Ionicons
                name={isPasswordVisible ? 'eye' : 'eye-off'}
                size={20}
                color="#aaa"
              />
            </TouchableOpacity>
          </View>

          {/* Delete Button */}
          <TouchableOpacity style={styles.button} onPress={handleDeleteAccount}>
            <Text style={styles.buttonText}>Delete Account</Text>
          </TouchableOpacity>

          {/* Cancel / Go back to Login */}
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
  /* Single-field styling for email */
  input: {
    height: 50,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: '#fff6e7',
    color: 'black',
    marginBottom: 15,
  },
  /* Container for password + icon */
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 25,
    backgroundColor: '#fff6e7',
    marginBottom: 15,
    height: 50,
    paddingHorizontal: 20,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
  eyeIcon: {
    padding: 5,
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
