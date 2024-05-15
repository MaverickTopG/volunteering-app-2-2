// screens/Register.js
import React, { Component } from 'react';
import { View, TextInput, TouchableOpacity, Text, StatusBar } from 'react-native';
import { commonStyles } from '../screens/commonStyles';
import { auth, db } from '../screens/config.js';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default class Register extends Component {
  state = { email: '', password: '', confirmedPassword: '', firstName: '', lastName: '' };

  signup = async () => {
    const { email, password, confirmedPassword, firstName, lastName } = this.state;
    if (password !== confirmedPassword) {
      alert("Passwords don't match");
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then(async userCredential => {
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), {
          firstName,
          lastName,
          email,
        });
        this.props.navigation.navigate('Login');
      })
      .catch(error => alert(error.message));
  };

  render() {
    return (
      <View style={commonStyles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#15193c" />
        <Text style={commonStyles.title}>Register</Text>
        <TextInput
          style={commonStyles.input}
          onChangeText={firstName => this.setState({ firstName })}
          placeholder="First Name"
          placeholderTextColor="#CCCCCC"
          value={this.state.firstName}
        />
        <TextInput
          style={commonStyles.input}
          onChangeText={lastName => this.setState({ lastName })}
          placeholder="Last Name"
          placeholderTextColor="#CCCCCC"
          value={this.state.lastName}
        />
        <TextInput
          style={commonStyles.input}
          onChangeText={email => this.setState({ email })}
          placeholder="Email"
          placeholderTextColor="#CCCCCC"
          value={this.state.email}
        />
        <TextInput
          style={commonStyles.input}
          onChangeText={password => this.setState({ password })}
          placeholder="Password"
          placeholderTextColor="#CCCCCC"
          secureTextEntry
          value={this.state.password}
        />
        <TextInput
          style={commonStyles.input}
          onChangeText={confirmedPassword => this.setState({ confirmedPassword })}
          placeholder="Confirm Password"
          placeholderTextColor="#CCCCCC"
          secureTextEntry
          value={this.state.confirmedPassword}
        />
        <TouchableOpacity style={commonStyles.button} onPress={this.signup}>
          <Text style={commonStyles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
