// LoginScreen.js

import React, { useState, useContext, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AuthContext } from './AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get('window');
const scale  = (s) => (width  / guidelineBaseWidth)  * s;
const vScale = (s) => (height / guidelineBaseHeight) * s;

export default function LoginScreen() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const { signIn } = useContext(AuthContext);
  const nav        = useNavigation();

  // Attempt to sign in
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      return Alert.alert('Error', 'Please enter both email and password.');
    }
    try {
      await signIn(email.trim(), password);
      Alert.alert('Success', 'Logged in successfully.');
    } catch {
      Alert.alert('Error', 'Invalid credentials.');
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* ─────────────────────────────────────────────
             BACKGROUND BLOBS
        ───────────────────────────────────────────── */}
        <View style={styles.topRightBlob} />
        <View style={styles.bottomLeftBlob} />

        {/* ─────────────────────────────────────────────
             DIAGONAL IMAGE & OVERLAY
        ───────────────────────────────────────────── */}
        <Image
          source={ require('../assets/bg1.png')}
          style={styles.diagonalImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(248,248,248,0)', 'rgba(248,248,248,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.diagonalOverlay}
        />

        {/* ─────────────────────────────────────────────
             BACK BUTTON
        ───────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => nav.goBack()}
        >
          <View style={styles.backCircle}>
            <Ionicons name="chevron-back" size={scale(20)} color="#444" />
          </View>
        </TouchableOpacity>

        {/* ─────────────────────────────────────────────
             MAIN LOGIN FORM
        ───────────────────────────────────────────── */}
        <View style={styles.content}>
          <Text style={styles.header}>
            Welcome back{'\n'}to NexoLink
          </Text>

          {/* Email Input */}
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

          {/* Password Input */}
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
                onPress={() => setIsVisible((v) => !v)}
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
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },

  // ─── BACKGROUND BLOBS ───────────────────────────────────────────
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

  // ─── DIAGONAL IMAGE & OVERLAY ─────────────────────────────────
  diagonalImage: {
    position: 'absolute',
    width: width * 1.4,
    height: width * 1.4,
    top: height * 0.2,
    left: -width * 0.7,
    opacity: 0.15,
    transform: [{ rotate: '45deg' }],
    zIndex: 1,
  },
  diagonalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },

  // ─── BACK BUTTON ───────────────────────────────────────────────
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

  // ─── MAIN FORM CONTENT ──────────────────────────────────────
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: scale(30),
    paddingTop: vScale(0),
    zIndex: 3, // keep above diagonal overlays
  },
  header: {
    fontSize: scale(32),
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: vScale(40),
    lineHeight: scale(40),
  },

  // ─── INPUT FIELDS ─────────────────────────────────────────────
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

  // ─── LOGIN BUTTON ─────────────────────────────────────────────
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

  // ─── SIGNUP PROMPT ────────────────────────────────────────────
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

  // ─── DELETE BUTTON ─────────────────────────────────────────────
  deleteButton: {
    marginTop: vScale(10),
    alignSelf: 'center',
  },
  deleteText: {
    color: '#FF4444',
    fontSize: scale(14),
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
