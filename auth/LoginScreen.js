// LoginScreen.js

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
const isTablet = width >= 768;
const isLandscape = width > height;

// Enhanced responsive scaling with breakpoints
const getResponsiveValue = (mobile, tablet = mobile, landscape = mobile) => {
  if (isLandscape) return landscape;
  if (isTablet) return tablet;
  return mobile;
};

// Responsive scaling functions
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const scale = (size, factor = 1) => {
  const scaleFactor = isTablet ? 1.2 : 1;
  return (width / guidelineBaseWidth) * size * scaleFactor * factor;
};
const vScale = (size, factor = 1) => {
  const scaleFactor = isTablet ? 1.1 : 1;
  return (height / guidelineBaseHeight) * size * scaleFactor * factor;
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const { signIn } = useContext(AuthContext);
  const nav = useNavigation();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      return Alert.alert('Error', 'Please enter both email and password.');
    }
    try {
      await signIn(email.trim(), password);
      Alert.alert('Success', 'Logged in successfully.');
      // nav.navigate('VolunteerDashboard');
    } catch {
      Alert.alert('Error', 'Invalid credentials.');
    }
  };

  const styles = getStyles();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={styles.container}>

            {/* BACKGROUND BLOBS */}
            <View style={styles.topRightBlob} />
            <View style={styles.bottomLeftBlob} />

            {/* DIAGONAL IMAGE & OVERLAY */}
            <Image
              source={require('../assets/bg1.png')}
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => nav.goBack()}
            >
              <View style={styles.backCircle}>
                <Ionicons 
                  name="chevron-back" 
                  size={scale(20)} 
                  color="#444" 
                />
              </View>
            </TouchableOpacity>

            {/* MAIN LOGIN FORM */}
            <View style={styles.contentWrapper}>
              <View style={styles.content}>
                <Text style={styles.header}>
                  Welcome back{isTablet || isLandscape ? ' ' : '\n'}to NexoLink
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
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={isVisible ? 'eye-outline' : 'eye-off-outline'}
                        size={scale(20)}
                        color="#888"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* LOGIN Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  activeOpacity={0.8}
                  style={styles.loginButton}
                >
                  <Text style={styles.loginText}>LOGIN</Text>
                </TouchableOpacity>

                {/* Signup Prompt */}
                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>New to NexoLink?</Text>
                  <TouchableOpacity onPress={() => nav.navigate('Register')}>
                    <Text style={styles.signupLink}> Sign up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

const getStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  topRightBlob: {
    position: 'absolute',
    top: getResponsiveValue(
      -height * 0.15,    // mobile
      -height * 0.12,    // tablet
      -height * 0.10     // landscape
    ),
    right: getResponsiveValue(
      -width * 0.3,      // mobile
      -width * 0.25,     // tablet
      -width * 0.20      // landscape
    ),
    width: getResponsiveValue(
      width * 0.8,       // mobile
      width * 0.6,       // tablet
      width * 0.5        // landscape
    ),
    height: getResponsiveValue(
      width * 0.8,       // mobile
      width * 0.6,       // tablet
      width * 0.5        // landscape
    ),
    borderRadius: getResponsiveValue(
      (width * 0.8) / 2,  // mobile
      (width * 0.6) / 2,  // tablet
      (width * 0.5) / 2   // landscape
    ),
    backgroundColor: 'rgba(200,230,255,0.3)',
    zIndex: 0,
  },
  bottomLeftBlob: {
    position: 'absolute',
    bottom: getResponsiveValue(
      -height * 0.15,    // mobile
      -height * 0.12,    // tablet
      -height * 0.10     // landscape
    ),
    left: getResponsiveValue(
      -width * 0.3,      // mobile
      -width * 0.25,     // tablet
      -width * 0.20      // landscape
    ),
    width: getResponsiveValue(
      width * 0.75,      // mobile
      width * 0.55,      // tablet
      width * 0.45       // landscape
    ),
    height: getResponsiveValue(
      width * 0.75,      // mobile
      width * 0.55,      // tablet
      width * 0.45       // landscape
    ),
    borderRadius: getResponsiveValue(
      (width * 0.75) / 2, // mobile
      (width * 0.55) / 2, // tablet
      (width * 0.45) / 2  // landscape
    ),
    backgroundColor: 'rgba(255,230,200,0.3)',
    zIndex: 0,
  },
  diagonalImage: {
    position: 'absolute',
    width: getResponsiveValue(
      width * 1.4,       // mobile
      width * 1.2,       // tablet
      width * 1.0        // landscape
    ),
    height: getResponsiveValue(
      width * 1.4,       // mobile
      width * 1.2,       // tablet
      width * 1.0        // landscape
    ),
    top: getResponsiveValue(
      height * 0.2,      // mobile
      height * 0.15,     // tablet
      height * 0.1       // landscape
    ),
    left: getResponsiveValue(
      -width * 0.7,      // mobile
      -width * 0.6,      // tablet
      -width * 0.5       // landscape
    ),
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
    top: getResponsiveValue(
      Platform.OS === 'android' ? scale(30) : scale(50),
      Platform.OS === 'android' ? scale(40) : scale(60),
      Platform.OS === 'android' ? scale(25) : scale(45)
    ),
    left: getResponsiveValue(
      scale(20),         // mobile
      scale(30),         // tablet
      scale(25)          // landscape
    ),
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
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getResponsiveValue(
      scale(30),         // mobile
      scale(60),         // tablet
      scale(40)          // landscape
    ),
    zIndex: 3,
  },
  content: {
    width: '100%',
    maxWidth: getResponsiveValue(
      400,               // mobile
      500,               // tablet
      600                // landscape
    ),
    ...(isLandscape && !isTablet && {
      paddingVertical: vScale(20),
    }),
  },
  header: {
    fontSize: getResponsiveValue(
      scale(32),         // mobile
      scale(38),         // tablet
      scale(28)          // landscape
    ),
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: getResponsiveValue(
      vScale(40),        // mobile
      vScale(50),        // tablet
      vScale(30)         // landscape
    ),
    lineHeight: getResponsiveValue(
      scale(40),         // mobile
      scale(46),         // tablet
      scale(34)          // landscape
    ),
  },
  inputContainer: {
    marginBottom: getResponsiveValue(
      vScale(20),        // mobile
      vScale(25),        // tablet
      vScale(18)         // landscape
    ),
  },
  inputLabel: {
    fontSize: scale(14),
    color: '#555',
    marginBottom: getResponsiveValue(
      vScale(6),         // mobile
      vScale(8),         // tablet
      vScale(5)          // landscape
    ),
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: scale(25),
    paddingHorizontal: scale(16),
    height: getResponsiveValue(
      vScale(48),        // mobile
      vScale(52),        // tablet
      vScale(44)         // landscape
    ),
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
  eyeButton: {
    marginLeft: scale(8),
    padding: scale(4),
  },
  loginButton: {
    backgroundColor: '#333',
    borderRadius: scale(25),
    height: getResponsiveValue(
      vScale(50),        // mobile
      vScale(55),        // tablet
      vScale(48)         // landscape
    ),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsiveValue(
      vScale(20),        // mobile
      vScale(25),        // tablet
      vScale(18)         // landscape
    ),
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
    marginTop: getResponsiveValue(
      vScale(10),        // mobile
      vScale(15),        // tablet
      vScale(8)          // landscape
    ),
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