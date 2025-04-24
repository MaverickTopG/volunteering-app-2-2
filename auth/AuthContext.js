import React, { createContext, useState, useEffect } from 'react';
import {
  Alert,
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  Image,
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
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';

export const AuthContext = createContext();

/* scaling helpers -------------------------------------------------- */
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get('window');
const scale = (s) => (width / guidelineBaseWidth) * s;
const vScale = (s) => (height / guidelineBaseHeight) * s;

/* session length */
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoad]  = useState(true);

  /* -------------------------------------------------------------- */
  /* auto-login on startup                                          */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const ts = await AsyncStorage.getItem('loginTime');
        if (!ts) return;

        if (Date.now() - parseInt(ts, 10) > ONE_WEEK_MS) {
          await AsyncStorage.removeItem('loginTime');
          await Keychain.resetGenericPassword();
          return;
        }
        const creds = await Keychain.getGenericPassword();
        if (!creds) return;

        const uc = await signInWithEmailAndPassword(
          auth,
          creds.username,
          creds.password
        );
        if (uc.user.emailVerified) setUser(uc.user);
      } catch (e) {
        console.error('Auto-login', e);
      } finally {
        setLoad(false);
      }
    })();
  }, []);

  /* -------------------------------------------------------------- */
  /* global auth listener                                           */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (current) => {
      setUser(current && current.emailVerified ? current : null);
    });
    return unsub;
  }, []);

  /* -------------------------------------------------------------- */
  /* sign-in                                                        */
  /* -------------------------------------------------------------- */
  const signIn = async (email, password) => {
    try {
      setLoad(true);
      const { user: u } = await signInWithEmailAndPassword(auth, email, password);

      if (!u.emailVerified) {
        await signOut(auth);
        Alert.alert(
          'Verify First',
          'Please confirm your email before logging in.'
        );
        return;
      }

      await AsyncStorage.setItem('loginTime', Date.now().toString());
      await Keychain.setGenericPassword(email, password);
      setUser(u);
    } catch (e) {
      Alert.alert('Login Error', e.message);
    } finally {
      setLoad(false);
    }
  };

  /* -------------------------------------------------------------- */
  /* sign-up                                                        */
  /* -------------------------------------------------------------- */
  const signUp = async ({ email, password, firstName, lastName }) => {
    try {
      setLoad(true);
      const { user: u } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(u, { displayName: `${firstName} ${lastName}` });
      await sendEmailVerification(u);

      /* Don’t keep session alive until they verify */
      await signOut(auth);
      Alert.alert(
        'Almost there…',
        'We sent you a verification link. Please verify your email, then log in.'
      );
      return true;
    } catch (e) {
      Alert.alert('Sign-Up Error', e.message);
      return false;
    } finally {
      setLoad(false);
    }
  };

  /* -------------------------------------------------------------- */
  /* reset password                                                 */
  /* -------------------------------------------------------------- */
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (e) {
      Alert.alert('Reset Error', e.message);
      return false;
    }
  };

  /* -------------------------------------------------------------- */
  /* sign-out / delete                                              */
  /* -------------------------------------------------------------- */
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

  /* -------------------------------------------------------------- */
  /* loading splash                                                 */
  /* -------------------------------------------------------------- */
  if (loading) {
    return (
      <View style={styles.splash}>
        <Image
          source={require('../assets/spaceship.png')}
          style={{ width: scale(150), height: scale(150), marginBottom: vScale(20) }}
          resizeMode="contain"
        />
        <Text style={{ fontSize: scale(18), color: '#333', marginBottom: vScale(12) }}>
          Preparing for launch…
        </Text>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  /* -------------------------------------------------------------- */
  /* provider                                                       */
  /* -------------------------------------------------------------- */
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
    </AuthContext.Provider>
  );
}

/* styles ---------------------------------------------------------- */
const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff6e7',
  },
});
