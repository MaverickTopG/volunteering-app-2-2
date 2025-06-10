import React, { createContext, useState, useEffect } from 'react';
import {
  Alert,
  ActivityIndicator,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

import { auth, db } from './firebase'; // Firebase Auth & Firestore instances
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  deleteUser,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
} from 'firebase/firestore';

export const AuthContext = createContext();

// Badge constants & initializer (unchanged)
const BADGE_IDS = [ /* ...badge IDs...*/ ];
async function initUserBadges(uid) {
  if (!uid) return;
  try {
    const badgeStatus = {};
    BADGE_IDS.forEach(id => (badgeStatus[id] = false));
    const statusRef = doc(collection(db, 'badges', uid, 'badgeData'), 'badgeStatus');
    if (!(await getDoc(statusRef)).exists()) {
      await setDoc(statusRef, badgeStatus);
    }
    const selectedRef = doc(collection(db, 'badges', uid, 'badgeData'), 'selectedBadges');
    await setDoc(selectedRef, { badges: [] });
  } catch {};
}

// Map Firebase error codes to friendly messages
function getFriendlyError(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address doesn’t look right.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with that email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'This email is already registered.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    default:
      return 'Oops! Something went wrong. Please try again.';
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { width, height } = Dimensions.get('window');
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

  // Auto-login on start
  useEffect(() => {
    (async () => {
      try {
        const last = await AsyncStorage.getItem('loginTime');
        if (last && Date.now() - Number(last) <= ONE_WEEK) {
          const creds = await Keychain.getGenericPassword();
          if (creds) {
            const { user: u } = await signInWithEmailAndPassword(auth, creds.username, creds.password);
            setUser(u);
          }
        }
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  // Listen for auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async current => {
      setUser(current);
      if (current) await initUserBadges(current.uid);
    });
    return unsub;
  }, []);

  // Sign in helper
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { user: u } = await signInWithEmailAndPassword(auth, email, password);
      await AsyncStorage.setItem('loginTime', Date.now().toString());
      await Keychain.setGenericPassword(email, password);
      setUser(u);
    } catch (e) {
      Alert.alert('Login Error', getFriendlyError(e.code));
    } finally {
      setLoading(false);
    }
  };

  // Sign up helper (just email + password)
  const signUp = async ({ email, password }) => {
    setLoading(true);
    try {
      const { user: u } = await createUserWithEmailAndPassword(auth, email, password);
      await initUserBadges(u.uid);
      await signOut(auth);
      Alert.alert('Success', 'Account created—please log in.');
      return true;
    } catch (e) {
      Alert.alert('Sign-up Error', getFriendlyError(e.code));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reset password helper
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Check your email', 'Password reset link sent.');
      return true;
    } catch (e) {
      Alert.alert('Reset Error', getFriendlyError(e.code));
      return false;
    }
  };

  // Sign out helper
  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      await AsyncStorage.removeItem('loginTime');
      await Keychain.resetGenericPassword();
    } catch (e) {
      Alert.alert('Logout Error', getFriendlyError(e.code));
    }
  };

  // Delete account helper
  const deleteAccount = async (email, password) => {
    setLoading(true);
    try {
      const { user: u } = await signInWithEmailAndPassword(auth, email, password);
      await deleteUser(u);
      setUser(null);
      await AsyncStorage.removeItem('loginTime');
      await Keychain.resetGenericPassword();
      Alert.alert('Account deleted', 'Your account has been removed.');
    } catch (e) {
      Alert.alert('Delete Error', getFriendlyError(e.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, resetPassword, signOut: signOutUser, deleteAccount }}>
      {children}
      {loading && (
        <View style={styles.splash}>
          <ActivityIndicator size="large" color="#333" />
        </View>
      )}
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  splash: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});
