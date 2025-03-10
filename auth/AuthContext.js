import React, { createContext, useState, useEffect } from 'react';
import { Alert, ActivityIndicator, View, StyleSheet, Text, Image, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './firebase'; // Import the initialized auth object
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  deleteUser,
} from 'firebase/auth';

export const AuthContext = createContext();

// Define baseline dimensions (iPhone 16 Pro Max as an example)
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes and auto sign out if login is older than one week
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const loginTimeStr = await AsyncStorage.getItem('loginTime');
          if (loginTimeStr) {
            const loginTime = parseInt(loginTimeStr, 10);
            const now = Date.now();
            if (now - loginTime > ONE_WEEK_MS) {
              // Automatically sign out the user after 1 week
              await signOut(auth);
              await AsyncStorage.removeItem('loginTime');
              setUser(null);
              Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
              setLoading(false);
              return;
            }
          }
        } catch (error) {
          console.error('Error checking login time:', error);
        }
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Store the login time (in ms) in AsyncStorage
      await AsyncStorage.setItem('loginTime', Date.now().toString());
      setUser(userCredential.user);
    } catch (error) {
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Automatically store the login time on sign up as well
      await AsyncStorage.setItem('loginTime', Date.now().toString());
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

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      await AsyncStorage.removeItem('loginTime');
    } catch (error) {
      Alert.alert('Logout Error', error.message);
    }
  };

  const deleteAccount = async (email, password) => {
    try {
      setLoading(true);
  
      // Authenticate the user with the provided email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
      // If authentication succeeds, delete the account
      const currentUser = userCredential.user;
      await deleteUser(currentUser);
  
      await AsyncStorage.removeItem('loginTime');
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
          source={require('../assets/spaceship.png')} // Replace with your app's logo
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
