import React, { Component } from 'react';
import { View, TextInput, TouchableOpacity, Text, StatusBar, StyleSheet } from 'react-native';
import { auth } from '../screens/config.js'; // Ensure this path is correct
import { signInWithEmailAndPassword } from 'firebase/auth';
import { RFValue } from 'react-native-responsive-fontsize';

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
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#15193c" />
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          onChangeText={email => this.setState({ email })}
          placeholder="Email address"
          placeholderTextColor="#CCCCCC"
          value={this.state.email}
        />
        <TextInput
          style={styles.input}
          onChangeText={password => this.setState({ password })}
          placeholder="Password"
          placeholderTextColor="#CCCCCC"
          secureTextEntry
          value={this.state.password}
        />
        <TouchableOpacity style={styles.button} onPress={this.signIn}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#00A4D3', marginTop: 10 }]}
          onPress={() => this.props.navigation.navigate('Register')}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

// Styles integrated within the same file
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#15193c',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    height: RFValue(50),
    backgroundColor: '#253041',
    marginVertical: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: RFValue(18),
    color: 'white',
    borderColor: '#0077B6',
    borderWidth: 2,
  },
  button: {
    width: '100%',
    padding: RFValue(15),
    backgroundColor: '#0077B6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: RFValue(20),
  },
  title: {
    fontSize: RFValue(24),
    color: 'white',
    marginBottom: 20,
  },
});
