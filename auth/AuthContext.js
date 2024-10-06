import React, { createContext, useState, useEffect } from 'react';
import { Alert, ActivityIndicator, View } from 'react-native'; // Import ActivityIndicator for loading
import { auth } from './firebase';  // Import the initialized auth object
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      setLoading(true); // Start loading when sign-in is in progress
      await signInWithEmailAndPassword(auth, email, password);  // Use the correct function signature
      Alert.alert("Success", "Logged in successfully");
    } catch (error) {
      Alert.alert("Login Error", error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const signUp = async (email, password) => {
    try {
      setLoading(true); // Start loading when sign-up is in progress
      await createUserWithEmailAndPassword(auth, email, password);  // Use the correct function signature
      Alert.alert("Success", "User registered successfully");
    } catch (error) {
      Alert.alert("Sign Up Error", error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);  // Sign out the user using the correct auth object
      setUser(null);
      Alert.alert("Success", "Logged out successfully");
    } catch (error) {
      Alert.alert("Logout Error", error.message);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut: signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
