// DeleteScreen.js

import React, { useState, useContext } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from './AuthContext';

const { width, height } = Dimensions.get('window');
const baseW = 428;
const baseH = 926;
const scale = s => (width / baseW) * s;
const vScale = s => (height / baseH) * s;

export default function DeleteScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);

  const { deleteAccount } = useContext(AuthContext);
  const nav = useNavigation();

  const handleDelete = async () => {
    if (!email.trim() || !password) {
      return Alert.alert('Error', 'Please enter both email and password.');
    }
    try {
      await deleteAccount(email.trim(), password);
      Alert.alert('Deleted', 'Your account has been deleted.');
    } catch {
      Alert.alert('Error', 'Could not delete. Check your credentials.');
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* Background blobs */}
        <View style={styles.topRightBlob} />
        <View style={styles.bottomLeftBlob} />

        {/* Diagonal image & overlay */}
        <Image
          source={require('../assets/bg3.png')}
          style={styles.diagonalImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(248,248,248,0)', 'rgba(248,248,248,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.diagonalOverlay}
        />

        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => nav.goBack()}
        >
          <View style={styles.backCircle}>
            <Ionicons name="chevron-back" size={scale(20)} color="#444" />
          </View>
        </TouchableOpacity>

        {/* Main form */}
        <View style={styles.content}>
          <Text style={styles.header}>Don't Go!</Text>

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
                secureTextEntry={!visible}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setVisible(v => !v)}
                style={{ marginLeft: scale(8) }}
              >
                <Ionicons
                  name={visible ? 'eye-outline' : 'eye-off-outline'}
                  size={scale(20)}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            onPress={handleDelete}
            activeOpacity={0.8}
            style={styles.deleteButton}
          >
            <LinearGradient
              colors={['#ff3b3b', '#ff6b6b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.deleteGradient}
            >
              <Text style={styles.deleteText}>Delete Account</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Cancel Link */}
          <TouchableOpacity onPress={() => nav.navigate('Login')}>
            <Text style={styles.cancelLink}>Cancel and go back</Text>
          </TouchableOpacity>
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

  // Background blobs
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

  // Diagonal image & overlay
  diagonalImage: {
    position: 'absolute',
    width: width * 2.4,
    height: width * 1.4,
    top: height * 0.8,
    left: width * 0.2,
    opacity: 0.15,
    transform: [{ rotate: '45deg' }],
    zIndex: 1,
  },
  diagonalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },

  // Back button
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

  // Main form content
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: scale(30),
    paddingTop: vScale(0),
    zIndex: 3,
  },
  header: {
    fontSize: scale(32),
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: vScale(40),
    lineHeight: scale(40),
  },

  // Input fields
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

  // Delete button
  deleteButton: {
    marginBottom: vScale(20),
  },
  deleteGradient: {
    borderRadius: scale(25),
    height: vScale(50),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  deleteText: {
    color: '#FFF',
    fontSize: scale(16),
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Cancel link
  cancelLink: {
    color: '#666',
    textAlign: 'center',
    fontSize: scale(14),
    textDecorationLine: 'underline',
  },
});
