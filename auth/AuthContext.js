import React, { createContext, useState, useEffect } from 'react';
import { Alert, ActivityIndicator, View, StyleSheet, Text, Image } from 'react-native';
import { auth } from './firebase'; // Import the initialized auth object
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  deleteUser,
  EmailAuthProvider, 
  reauthenticateWithCredential,y
} from 'firebase/auth';
;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false); // Stop loading once the user is fetched
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };
  const signUp = async (email, password) => {
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Account created successfully!'); // Show success message
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
      const currentUser = userCredential.user; // Get the authenticated user
      await deleteUser(currentUser);
  
      Alert.alert('Success', 'Your account and its content have been deleted.');
      return true;
    } catch (error) {
      Alert.alert('Error', error.message); // Show error message if authentication or deletion fails
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
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
});
