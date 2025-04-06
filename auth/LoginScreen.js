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
  Dimensions,
} from 'react-native';
import { AuthContext } from './AuthContext';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { signIn } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      await signIn(email, password);
      Alert.alert('Login Successful', 'You are now logged in.');
    } catch (error) {
      console.error(error);
      Alert.alert('Login Failed', 'Please check your credentials and try again.');
    }
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
        {/* Header with Gradient */}
        <LinearGradient
          colors={['rgba(255,240,212,0.8)', 'rgba(255,232,201,0.8)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerContainer}
        >
          <Text style={styles.headerText}>Volunteer Logs</Text>
        </LinearGradient>

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

          {/* Gradient Login Button */}
          <TouchableOpacity onPress={handleLogin} activeOpacity={0.85}>
            <LinearGradient
              colors={['#fff0d4', '#ffe8c9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Login</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Don't have an account? Sign up</Text>
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
    backgroundColor: '#fff6e7',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  headerContainer: {
    marginBottom: verticalScale(30),
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(20),
    borderRadius: scale(25),
    alignItems: 'center',
    shadowColor: '#ffe8c9',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.6,
    shadowRadius: scale(6),
    elevation: 6,
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
    backgroundColor: '#fff6e7',
    borderColor: '#e1c699',
    borderWidth: scale(1),
    borderRadius: scale(25),
    paddingHorizontal: scale(20),
    fontSize: scale(16),
    color: '#333',
    marginBottom: verticalScale(15),
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff6e7',
    borderColor: '#e1c699',
    borderWidth: scale(1),
    borderRadius: scale(25),
    marginBottom: verticalScale(15),
    height: verticalScale(50),
    paddingHorizontal: scale(20),
  },
  passwordInput: {
    flex: 1,
    fontSize: scale(16),
    color: '#333',
  },
  eyeIcon: {
    padding: scale(5),
  },
  button: {
    backgroundColor: 'transparent',
    borderRadius: scale(25),
    paddingVertical: scale(15),
    paddingHorizontal: scale(30),
    alignItems: 'center',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(20),
    shadowColor: '#ffe8c9',
    shadowOpacity: 0.6,
    shadowRadius: scale(6),
    shadowOffset: { width: 0, height: scale(4) },
    elevation: 6,
  },
  buttonText: {
    color: '#333',
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
