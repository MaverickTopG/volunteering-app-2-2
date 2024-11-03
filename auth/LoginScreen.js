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
  Image,
} from 'react-native';
import { AuthContext } from './AuthContext'; // Adjust the path to your AuthContext
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Import for back icon (make sure to install @expo/vector-icons if not done already)

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useContext(AuthContext); // Use the signIn method from AuthContext
  const navigation = useNavigation(); // For navigating to RegisterScreen or going back

  const handleLogin = () => {
    signIn(email, password).then(() => {
      // After successful login, navigate to NexoLink (AnimalTabNavigator)
      navigation.navigate('NexoLink');
    }).catch(error => {
      console.error(error);
      Alert.alert('Login Failed', 'Please check your credentials and try again.');
    });
  };

  const handleBackPress = () => {
    navigation.navigate('NexoLink'); // Navigate to the NexoLink (AnimalTabNavigator)
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Logo at the top */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/spaceship.png')} // Adjust the path to your logo
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={styles.contentContainer}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupText}>Don't have an account? Sign up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7', // Matching the light cream color
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 100, // Adjust as needed
  },
  logo: {
    width: 200, // Adjust the size of your logo
    height: 200,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: -50, // Adjust to position inputs closer to the logo
  },
  inputContainer: {
    // Additional styling if needed
  },
  input: {
    height: 50,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 25, // Rounded corners
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: '#fff6e7',
    color: 'black',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#000', // Black background for contrast
    padding: 15,
    borderRadius: 25, // Rounded corners
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff6e7', // Cream-colored text
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 16,
  },
});
