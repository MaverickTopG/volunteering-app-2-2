import React, { createContext, useContext, useEffect, useState } from 'react';
import firebase from './firebase'; // Ensure this imports your firebase configuration correctly

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe; // Unsubscribe on unmount
  }, []);

  const signIn = (email, password) => {
    return firebase.auth().signInWithEmailAndPassword(email, password);
  };

  const signUp = (email, password) => {
    return firebase.auth().createUserWithEmailAndPassword(email, password);
  };

  const signOut = () => {
    return firebase.auth().signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
