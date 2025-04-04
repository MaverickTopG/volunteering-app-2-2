import React, { createContext, useState, useEffect } from 'react';
import { Alert, ActivityIndicator, View, StyleSheet, Text, Image, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { auth } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  deleteUser,
} from 'firebase/auth';

export const AuthContext = createContext();

const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto‑login on app startup using secure storage for credentials.
  useEffect(() => {
    const autoLogin = async () => {
      try {
        // Retrieve login time from AsyncStorage.
        const loginTimeStr = await AsyncStorage.getItem('loginTime');
        if (loginTimeStr) {
          const loginTime = parseInt(loginTimeStr, 10);
          if (Date.now() - loginTime <= ONE_WEEK_MS) {
            // Retrieve credentials securely from Keychain.
            const credentials = await Keychain.getGenericPassword();
            if (credentials) {
              const { username: storedEmail, password: storedPassword } = credentials;
              const userCredential = await signInWithEmailAndPassword(auth, storedEmail, storedPassword);
              setUser(userCredential.user);
              return; // Successful auto‑login.
            }
          } else {
            // If the session is expired, remove stored data.
            await AsyncStorage.removeItem('loginTime');
            await Keychain.resetGenericPassword();
          }
        }
      } catch (error) {
        console.error('Auto login error:', error);
      } finally {
        setLoading(false);
      }
    };

    autoLogin();
  }, []);

  // Listen to auth state changes and check session expiration.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const loginTimeStr = await AsyncStorage.getItem('loginTime');
          if (loginTimeStr) {
            const loginTime = parseInt(loginTimeStr, 10);
            if (Date.now() - loginTime > ONE_WEEK_MS) {
              await signOut(auth);
              await AsyncStorage.removeItem('loginTime');
              await Keychain.resetGenericPassword();
              setUser(null);
              Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
              return;
            }
          }
        } catch (error) {
          console.error('Error checking login time:', error);
        }
      }
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Periodic session check (every 60 seconds)
  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (auth.currentUser) {
        try {
          const loginTimeStr = await AsyncStorage.getItem('loginTime');
          if (loginTimeStr) {
            const loginTime = parseInt(loginTimeStr, 10);
            if (Date.now() - loginTime > ONE_WEEK_MS) {
              await signOut(auth);
              await AsyncStorage.removeItem('loginTime');
              await Keychain.resetGenericPassword();
              setUser(null);
              Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
            }
          }
        } catch (error) {
          console.error('Error during periodic session check:', error);
        }
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Sign in: store login time in AsyncStorage and credentials in secure Keychain.
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await AsyncStorage.setItem('loginTime', Date.now().toString());
      await Keychain.setGenericPassword(email, password);
      setUser(userCredential.user);
    } catch (error) {
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Sign up: create account and securely store credentials.
  const signUp = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await AsyncStorage.setItem('loginTime', Date.now().toString());
      await Keychain.setGenericPassword(email, password);
      setUser(userCredential.user);
      Alert.alert('Success', 'Account created successfully!');
      return true;
    } catch (error) {
      Alert.alert('Sign Up Error', error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign out: clear both AsyncStorage and secure Keychain.
  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      await AsyncStorage.removeItem('loginTime');
      await Keychain.resetGenericPassword();
    } catch (error) {
      Alert.alert('Logout Error', error.message);
    }
  };

  // Delete account: reauthenticate then delete account, and clear stored data.
  const deleteAccount = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;
      await deleteUser(currentUser);
      await AsyncStorage.removeItem('loginTime');
      await Keychain.resetGenericPassword();
      Alert.alert('Success', 'Your account and its content have been deleted.');
      return true;
    } catch (error) {
      Alert.alert('Error', error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('../assets/spaceship.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.loadingText}>Preparing for launch...</Text>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut: signOutUser, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff6e7',
  },
  logo: {
    width: scale(150),
    height: scale(150),
    marginBottom: verticalScale(20),
  },
  loadingText: {
    fontSize: scale(18),
    color: '#333',
    marginBottom: verticalScale(10),
  },
});

export default AuthProvider;
