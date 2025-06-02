// AuthContext.js

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
import { auth } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  deleteUser,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';

export const AuthContext = createContext();

/* ── scaling helpers ─────────────────────────────── */
const { width, height } = Dimensions.get('window');
const refW = 428,
  refH = 926;
const scale = (s) => (width / refW) * s;
const vScale = (s) => (height / refH) * s;

/* constants */
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

/* ----------------------------------------------------------------- */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoad] = useState(true);

  /* ---------- auto-login on mount ---------- */
  useEffect(() => {
    (async () => {
      try {
        const loginTime = await AsyncStorage.getItem('loginTime');
        if (!loginTime) return;

        if (Date.now() - Number(loginTime) > ONE_WEEK) {
          await AsyncStorage.removeItem('loginTime');
          await Keychain.resetGenericPassword();
          return;
        }

        const creds = await Keychain.getGenericPassword();
        if (!creds) return;

        // Attempt to sign in using stored credentials
        const { user: u } = await signInWithEmailAndPassword(
          auth,
          creds.username,
          creds.password
        );
        setUser(u);
      } catch (e) {
        console.error('Auto-login error:', e);
      } finally {
        setLoad(false);
      }
    })();
  }, []);

  /* ---------- global auth listener ---------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (current) => {
      // No longer filtering by emailVerified; any signed-in user is allowed
      setUser(current);
    });
    return unsub;
  }, []);

  /* ---------- helpers ---------- */
  const signIn = async (email, password) => {
    try {
      setLoad(true);

      const { user: u } = await signInWithEmailAndPassword(auth, email, password);
      // No more check on u.emailVerified
      await AsyncStorage.setItem('loginTime', Date.now().toString());
      await Keychain.setGenericPassword(email, password);
      setUser(u);
    } catch (e) {
      Alert.alert('Login Error', e.message);
    } finally {
      setLoad(false);
    }
  };

  const signUp = async ({ email, password, firstName, lastName }) => {
    try {
      setLoad(true);

      // Create user with email & password
      const { user: u } = await createUserWithEmailAndPassword(auth, email, password);

      // Set displayName
      await updateProfile(u, { displayName: `${firstName} ${lastName}` });

      // NO sendEmailVerification(u) HERE, so no verification email is sent
      // Immediately sign out to clear any internal state (optional)
      await signOut(auth);

      Alert.alert('Success', 'Account created successfully. You can now log in.');
      return true;
    } catch (e) {
      Alert.alert('Sign-up Error', e.message);
      return false;
    } finally {
      setLoad(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (e) {
      Alert.alert('Reset Error', e.message);
      return false;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      await AsyncStorage.removeItem('loginTime');
      await Keychain.resetGenericPassword();
    } catch (e) {
      Alert.alert('Logout Error', e.message);
    }
  };

  const deleteAccount = async (email, password) => {
    try {
      setLoad(true);

      // Reauthenticate then delete
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await deleteUser(cred.user);

      await AsyncStorage.removeItem('loginTime');
      await Keychain.resetGenericPassword();
      Alert.alert('Success', 'Account deleted.');
    } catch (e) {
      Alert.alert('Delete Error', e.message);
    } finally {
      setLoad(false);
    }
  };

  /* ---------- render ---------- */
  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signUp,
        resetPassword,
        signOut: signOutUser,
        deleteAccount,
      }}
    >
      {children}

      {/* splash overlay: plain white background + loading spinner */}
      {loading && (
        <View style={styles.splash}>
          <ActivityIndicator size="large" color="#333" />
        </View>
      )}
    </AuthContext.Provider>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  splash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});
