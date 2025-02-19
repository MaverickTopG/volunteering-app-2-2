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
import { AuthContext } from './AuthContext'; // Adjust the path as needed
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { signUp } = useContext(AuthContext); // Use signUp from AuthContext
  const navigation = useNavigation();

  const handleSignUp = async () => {
    // Adjust signUp to handle first/last name if needed
    const success = await signUp(email, password, firstName, lastName);
    if (success) {
      navigation.navigate('Login');
    }
  };

  const handleNavigateToLogin = () => {
    navigation.navigate('Login');
  };

  const handleNavigateToDelete = () => {
    navigation.navigate('Delete');
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
          <Text style={styles.headerText}>Create Account</Text>
        </View>

        <View style={styles.inputContainer}>

          {/* Email */}
          <View style={styles.inputWrapper}>
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
          </View>

          {/* Password with eye icon */}
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

          {/* Sign Up Button */}
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          {/* Links */}
          <TouchableOpacity onPress={handleNavigateToLogin}>
            <Text style={styles.linkText}>Already have an account? Log in</Text>
          </TouchableOpacity>

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
    backgroundColor: '#fff6e7', // Light cream background
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
  /* 
    Wrapper for each text input so we can have 
    consistent styling & spacing.
  */
  inputWrapper: {
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 25,
    backgroundColor: '#fff6e7',
    marginBottom: 15,
  },
  input: {
    height: 50,
    paddingHorizontal: 20,
    fontSize: 16,
    color: 'black',
  },
  /* 
    Password container with the same styling 
    but includes an icon on the right side.
  */
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
    backgroundColor: '#000', // Black button
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff6e7', // Cream-colored text
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#333',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
    textDecorationLine: 'underline',
  },
});
