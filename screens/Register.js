import React, { useState, useEffect } from 'react';
import {
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Text,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import styles from '../screens/styles';
import { auth, database } from './firebase'; // Ensure the correct import path to your firebase.js

const Register = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      console.log('Keyboard shown');
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      console.log('Keyboard hidden');
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const signup = (email, password, confirmedPassword, firstName, lastName) => {
    if (password === confirmedPassword) {
      auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          alert('User Registered');
          navigation.navigate('login');
          const userRef = database.ref('/users/' + userCredential.user.uid);
          userRef.set({
            email: userCredential.user.email,
            first_name: firstName,
            last_name: lastName,
            current_theme: 'dark',
          });
        })
        .catch((error) => {
          alert(error.message);
        });
    } else {
      alert('Password does not match');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <SafeAreaView style={styles.droidSafeArea} />

        <Text style={styles.title}>Register</Text>

        <TextInput
          style={styles.input}
          onChangeText={setFirstName}
          value={firstName}
          placeholder="Enter First Name"
          placeholderTextColor="#ccc"
        />
        <TextInput
          style={styles.input}
          onChangeText={setLastName}
          value={lastName}
          placeholder="Enter Last Name"
          placeholderTextColor="#ccc"
        />
        <TextInput
          style={styles.input}
          onChangeText={setEmail}
          value={email}
          placeholder="Enter Email"
          placeholderTextColor="#ccc"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          onChangeText={setPassword}
          value={password}
          secureTextEntry
          placeholder="Enter Password"
          placeholderTextColor="#ccc"
        />
        <TextInput
          style={styles.input}
          onChangeText={setConfirmedPassword}
          value={confirmedPassword}
          secureTextEntry
          placeholder="Confirm Password"
          placeholderTextColor="#ccc"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => signup(email, password, confirmedPassword, firstName, lastName)}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Register;
