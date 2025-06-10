// RegisterScreen.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from './AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const scale  = (s) => (width  / guidelineBaseWidth)  * s;
const vScale = (s) => (height / guidelineBaseHeight) * s;

export default function RegisterScreen() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const { signUp } = useContext(AuthContext);
  const nav        = useNavigation();

  const handleRegister = async () => {
    if (!email.trim() || !password) {
      return Alert.alert('Error', 'Please fill in all fields.');
    }
    try {
      await signUp({ email: email.trim(), password });
      Alert.alert('Success', 'Account created successfully.');
      // nav.navigate('VolunteerDashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      Alert.alert('Error', 'Registration failed. ' + (error.message || ''));
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={styles.container}>

            {/* BACKGROUND BLOBS & IMAGE */}
            <View style={styles.topRightBlob} />
            <View style={styles.bottomLeftBlob} />
            <Image
              source={require('../assets/bg2.png')}
              style={styles.diagonalImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(248,248,248,0)', 'rgba(248,248,248,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.diagonalOverlay}
            />

            {/* BACK BUTTON */}
            <TouchableOpacity style={styles.backButton} onPress={() => nav.goBack()}>
              <View style={styles.backCircle}>
                <Ionicons name="chevron-back" size={scale(20)} color="#444" />
              </View>
            </TouchableOpacity>

            {/* MAIN FORM - centered vertically */}
            <View style={styles.content}>
              <Text style={styles.header}>
                Create your{'\n'}NexoLink account
              </Text>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="mail-outline"
                    size={scale(20)}
                    color="#888"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#AAA"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={scale(20)}
                    color="#888"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#AAA"
                    secureTextEntry={!isVisible}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setIsVisible(v => !v)}
                    style={{ marginLeft: scale(8) }}
                  >
                    <Ionicons
                      name={isVisible ? 'eye-outline' : 'eye-off-outline'}
                      size={scale(20)}
                      color="#888"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* REGISTER BUTTON */}
              <TouchableOpacity
                onPress={handleRegister}
                activeOpacity={0.8}
                style={styles.loginButton}
              >
                <Text style={styles.loginText}>REGISTER</Text>
              </TouchableOpacity>

              {/* LOGIN PROMPT */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => nav.navigate('Login')}>
                  <Text style={styles.signupLink}> Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  topRightBlob: {
    position: 'absolute',
    top: -height * 0.15,
    right: -width * 0.3,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: 'rgba(200,230,255,0.3)',
    zIndex: 0,
  },
  bottomLeftBlob: {
    position: 'absolute',
    bottom: -height * 0.15,
    left: -width * 0.3,
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: (width * 0.75) / 2,
    backgroundColor: 'rgba(255,230,200,0.3)',
    zIndex: 0,
  },
  diagonalImage: {
    position: 'absolute',
    width: width * 1.4,
    height: width * 1.4,
    top: height * 0.2,
    left: width * 0.5,
    opacity: 0.15,
    transform: [{ rotate: '45deg' }],
    zIndex: 1,
  },
  diagonalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? scale(30) : scale(50),
    left: scale(20),
    zIndex: 10,
  },
  backCircle: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    justifyContent: 'center',         // <-- center vertically
    paddingHorizontal: scale(30),
    zIndex: 3,
  },
  header: {
    fontSize: scale(32),
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: vScale(30),
    lineHeight: scale(40),
  },
  inputContainer: {
    marginBottom: vScale(20),
  },
  inputLabel: {
    fontSize: scale(14),
    color: '#555',
    marginBottom: vScale(6),
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: scale(25),
    paddingHorizontal: scale(16),
    height: vScale(48),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: scale(8),
  },
  input: {
    flex: 1,
    fontSize: scale(16),
    color: '#333',
    paddingVertical: 0,
  },
  loginButton: {
    backgroundColor: '#333',
    borderRadius: scale(25),
    height: vScale(50),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  loginText: {
    color: '#FFF',
    fontSize: scale(16),
    fontWeight: '700',
    letterSpacing: 1,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#666',
    fontSize: scale(14),
  },
  signupLink: {
    color: '#333',
    fontSize: scale(14),
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
