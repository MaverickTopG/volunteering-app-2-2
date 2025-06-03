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

import { auth, db } from './firebase'; // Your Firebase Web SDK auth & Firestore instances
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  deleteUser,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
} from 'firebase/firestore';

export const AuthContext = createContext();

/* ── scaling helpers ─────────────────────────────── */
const { width, height } = Dimensions.get('window');
const refW = 428,
  refH = 926;
const scale = (s) => (width / refW) * s;
const vScale = (s) => (height / refH) * s;

/* constants */
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

/* ─────────────────────────────────────────────────────────────────────────
   1) BADGE DEFINITIONS
   We only need the array of badge IDs. If you add/remove badges, update this list.
───────────────────────────────────────────────────────────────────────── */
const BADGE_IDS = [
  'first_volunteer',
  'early_bird',
  'weekend_warrior',
  'helping_hand',
  'community_helper',
  'dedication',
  'commitment',
  'champion',
  'hero',
  'legend',
  'streak_3',
  'streak_7',
  'streak_30',
  'animal_lover',
  'food_hero',
  'education_supporter',
  'environment_guardian',
  'senior_friend',
  'youth_mentor',
  'health_advocate',
  'team_player',
  'solo_hero',
  'night_owl',
  'rain_or_shine',
  'holiday_helper',
  'impact_maker',
  'inspiration',
  'changemaker',
  'community_pillar',
  'volunteer_master',
];

/**
 * Helper: Initialize badges for a given user‐UID.
 * - Ensures /badges/{uid}/badgeData/badgeStatus exists with all badge IDs = false
 * - Ensures /badges/{uid}/badgeData/selectedBadges exists with { badges: [] }
 */
async function initUserBadges(uid) {
  if (!uid) return;

  try {
    // 1) Build a “badgeStatus” object where every badge ID maps to false
    const badgeStatusData = {};
    BADGE_IDS.forEach((id) => {
      badgeStatusData[id] = false;
    });

    // 2) Reference: /badges/{uid}/badgeData/badgeStatus
    const badgeStatusRef = doc(collection(db, 'badges', uid, 'badgeData'), 'badgeStatus');
    const badgeStatusSnap = await getDoc(badgeStatusRef);

    if (!badgeStatusSnap.exists()) {
      // If it doesn't exist, create it
      await setDoc(badgeStatusRef, badgeStatusData);
      console.log(`badgeStatus created for UID=${uid}`);
    } else {
      console.log(`badgeStatus already exists for UID=${uid}`);
    }

    // 3) Reference: /badges/{uid}/badgeData/selectedBadges
    const selectedRef = doc(collection(db, 'badges', uid, 'badgeData'), 'selectedBadges');
    // Always (re)initialize to an empty array (you can remove this if you want to preserve)
    await setDoc(selectedRef, { badges: [] });
    console.log(`selectedBadges initialized for UID=${uid}`);
  } catch (err) {
    console.error(`Error initializing badges for UID=${uid}:`, err);
  }
}

/* ----------------------------------------------------------------- */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoad] = useState(true);

  /* ─── auto‐login on mount ───────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const loginTime = await AsyncStorage.getItem('loginTime');
        if (!loginTime) return;

        // If more than a week old, clear stored credentials
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

  /* ─── global auth listener ───────────────────────────────────────── */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (current) => {
      setUser(current);
      if (current) {
        // Initialize badges for this user (create docs if missing)
        await initUserBadges(current.uid);
      }
    });
    return unsubscribe;
  }, []);

  /* ─── signIn helper ─────────────────────────────────────────────── */
  const signIn = async (email, password) => {
    try {
      setLoad(true);
      const { user: u } = await signInWithEmailAndPassword(auth, email, password);

      // Store login time + Keychain credentials
      await AsyncStorage.setItem('loginTime', Date.now().toString());
      await Keychain.setGenericPassword(email, password);

      setUser(u);
      // initUserBadges will run via onAuthStateChanged
    } catch (e) {
      Alert.alert('Login Error', e.message);
    } finally {
      setLoad(false);
    }
  };

  /* ─── signUp helper ─────────────────────────────────────────────── */
  const signUp = async ({ email, password, firstName, lastName }) => {
    try {
      setLoad(true);

      // 1) Create user with email & password
      const { user: u } = await createUserWithEmailAndPassword(auth, email, password);

      // 2) Set displayName so the user’s profile is populated
      await updateProfile(u, { displayName: `${firstName} ${lastName}` });

      // 3) Initialize badges for this new user
      await initUserBadges(u.uid);

      // 4) Sign out immediately (mimic your original flow)
      await signOut(auth);
      setUser(null);

      Alert.alert('Success', 'Account created successfully. Please log in.');
      return true;
    } catch (e) {
      Alert.alert('Sign-up Error', e.message);
      return false;
    } finally {
      setLoad(false);
    }
  };

  /* ─── resetPassword helper ──────────────────────────────────────── */
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (e) {
      Alert.alert('Reset Error', e.message);
      return false;
    }
  };

  /* ─── signOut helper ────────────────────────────────────────────── */
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

  /* ─── deleteAccount helper ─────────────────────────────────────── */
  const deleteAccount = async (email, password) => {
    try {
      setLoad(true);
      // Reauthenticate then delete
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await deleteUser(cred.user);

      setUser(null);
      await AsyncStorage.removeItem('loginTime');
      await Keychain.resetGenericPassword();
      Alert.alert('Success', 'Account deleted.');
    } catch (e) {
      Alert.alert('Delete Error', e.message);
    } finally {
      setLoad(false);
    }
  };

  /* ─── render ─────────────────────────────────────────────────────── */
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

      {/* If loading, show a full-screen white spinner overlay */}
      {loading && (
        <View style={styles.splash}>
          <ActivityIndicator size="large" color="#333" />
        </View>
      )}
    </AuthContext.Provider>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────── */
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
