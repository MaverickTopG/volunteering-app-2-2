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
} from 'react-native';
import { AuthContext } from './AuthContext'; // Adjust the path to your AuthContext
import { useNavigation } from '@react-navigation/native';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp } = useContext(AuthContext); // Use the signUp method from AuthContext
  const navigation = useNavigation(); // For navigating between screens

  const handleSignUp = async () => {
    const success = await signUp(email, password);
    if (success) {
      // Navigate directly to the Login screen after successful sign-up
      navigation.navigate('Login');
    }
  };

  const handleNavigateToLogin = () => {
    navigation.navigate('Login'); // Navigate to the Login screen
  };

  const handleNavigateToDelete = () => {
    navigation.navigate('Delete'); // Navigate to the Delete Account screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={styles.contentContainer}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Create Account</Text>
        </View>

        <View style={styles.inputContainer}>
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
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            keyboardAppearance="dark" 
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNavigateToLogin}>
            <Text style={styles.linkText}>Already have an account? Log in</Text>
          </TouchableOpacity>

          {/* New Button for Delete Account */}
          <TouchableOpacity onPress={handleNavigateToDelete}>
            <Text style={styles.linkText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

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
    backgroundColor: '#000', // Black button for contrast
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
  linkText: {
    color: '#333', // Matching the color in the screenshot
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
    textDecorationLine: 'underline', // Optional for making it more link-like
  },
});
