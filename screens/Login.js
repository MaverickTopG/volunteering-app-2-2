// screens/Login.js
import React, { Component } from 'react';
import { View, TextInput, TouchableOpacity, Text, StatusBar } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import { auth } from '../screens/config.js';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default class Login extends Component {
  state = { email: '', password: '' };

  signIn = async () => {
    const { email, password } = this.state;
    signInWithEmailAndPassword(auth, email, password)
      .then(() => this.props.navigation.navigate('Dashboard'))
      .catch(error => alert(error.message));
  };

  render() {
    return (
      <View style={commonStyles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#15193c" />
        <Text style={commonStyles.title}>Login</Text>
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
        <TouchableOpacity style={commonStyles.button} onPress={this.signIn}>
          <Text style={commonStyles.buttonText}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[commonStyles.button, { backgroundColor: '#00A4D3', marginTop: 10 }]}
          onPress={() => this.props.navigation.navigate('Register')}
        >
          <Text style={commonStyles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
