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
  Dimensions,
  Alert,
} from 'react-native';
import { AuthContext } from './AuthContext'; // Adjust path to your AuthContext
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

const DeleteScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { deleteAccount } = useContext(AuthContext); // Use deleteAccount from AuthContext
  const navigation = useNavigation();

  const handleDeleteAccount = async () => {
    try {
      const success = await deleteAccount(email, password);
      // Add any additional logic if needed based on success/failure.
    } catch (error) {
      console.error(error);
      Alert.alert('Delete Failed', 'Could not delete the account. Check credentials and try again.');
    }
  };

  const handleNavigateToLogin = () => {
    navigation.navigate('Login'); // Navigate back to Login
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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

          {/* Password Field with Toggle Icon */}
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
                size={scale(20)}
                color="#aaa"
              />
            </TouchableOpacity>
          </View>

          {/* Delete Button with Red Gradient */}
          <TouchableOpacity onPress={handleDeleteAccount} activeOpacity={0.85}>
            <LinearGradient
              colors={['#ff3b3b', '#ff6b6b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Delete Account</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Cancel / Go Back to Login */}
          <TouchableOpacity onPress={handleNavigateToLogin}>
            <Text style={styles.linkText}>Cancel and go back to Login</Text>
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
    backgroundColor: '#fff6e7', // Light cream background
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  headerContainer: {
    marginBottom: verticalScale(30),
    alignItems: 'center',
  },
  headerText: {
    fontSize: scale(28),
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    marginTop: verticalScale(20),
  },
  input: {
    height: verticalScale(50),
    borderColor: '#e1c699',
    borderWidth: scale(1),
    borderRadius: scale(25),
    paddingHorizontal: scale(20),
    fontSize: scale(16),
    backgroundColor: '#fff6e7',
    color: 'black',
    marginBottom: verticalScale(15),
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#e1c699',
    borderWidth: scale(1),
    borderRadius: scale(25),
    backgroundColor: '#fff6e7',
    marginBottom: verticalScale(15),
    height: verticalScale(50),
    paddingHorizontal: scale(20),
  },
  passwordInput: {
    flex: 1,
    fontSize: scale(16),
    color: 'black',
  },
  eyeIcon: {
    padding: scale(5),
  },
  button: {
    borderRadius: scale(25),
    paddingVertical: scale(15),
    paddingHorizontal: scale(30),
    alignItems: 'center',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(20),
    shadowColor: '#ff6b6b',
    shadowOpacity: 0.6,
    shadowRadius: scale(6),
    shadowOffset: { width: 0, height: scale(4) },
    elevation: 6,
  },
  buttonText: {
    color: '#fff6e7', // Cream-colored text for consistency
    fontSize: scale(16),
    fontWeight: 'bold',
  },
  linkText: {
    color: '#333',
    textAlign: 'center',
    fontSize: scale(16),
    marginTop: verticalScale(10),
  },
});
