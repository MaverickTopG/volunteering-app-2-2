// RegisterScreen.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from './AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const getResponsiveValues = () => {
  const screenRatio = width / height;
  const isVerySmallScreen = width < 405;
  const isSmallScreen = width < 410;
  const isMediumScreen = width >= 440 && width < 600;
     
  return {
    statusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : isVerySmallScreen ? 40 : isMediumScreen ? 20 : 44,
    headerImageHeight: isVerySmallScreen ? 160 : isMediumScreen ? 250 : 140,
    bottomSheetHeight: height * (isVerySmallScreen ? 0.78 : 0.77),
    backCircleSize: isVerySmallScreen ? 32 : 36,
    backIconSize: isVerySmallScreen ? 20 : 24,
    borderRadius: isVerySmallScreen ? 20 : 24,
    cardBorderRadius: isVerySmallScreen ? 14 : 16,
    horizontalPadding: isVerySmallScreen ? 12 : 16,
    verticalPadding: isVerySmallScreen ? 16 : 20,
    marginBottom: isVerySmallScreen ? 12 : 16,
    scrollMarginTop: isVerySmallScreen ? 0 : 0,
    paddingBottom: isVerySmallScreen ? 40 : 60,
    handleBarWidth: isVerySmallScreen ? 35 : 40,
  };
};

export default function RegisterScreen() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const { signUp } = useContext(AuthContext);
  const nav        = useNavigation();
  const responsive = getResponsiveValues();

  const handleRegister = async () => {
    if (!email.trim() || !password) {
      return Alert.alert('Error', 'Please fill in all fields.');
    }
    try {
      await signUp({ email: email.trim(), password });
      Alert.alert('Success', 'Account created successfully.');
      // nav.navigate('VolunteerDashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      Alert.alert('Error', 'Registration failed. ' + (error.message || ''));
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={styles.container}>

            {/* BACKGROUND BLOBS & IMAGE */}
            <View style={styles.topRightBlob} />
            <View style={styles.bottomLeftBlob} />
            <Image
              source={require('../assets/bg2.png')}
              style={styles.diagonalImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(248,248,248,0)', 'rgba(248,248,248,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.diagonalOverlay}
            />

            {/* BACK BUTTON */}
            <TouchableOpacity style={[styles.backButton, {
              top: Platform.OS === 'android' ? responsive.statusBarHeight + 10 : responsive.statusBarHeight + 10,
              left: responsive.horizontalPadding + 4,
            }]} onPress={() => nav.goBack()}>
              <View style={[styles.backCircle, {
                width: responsive.backCircleSize,
                height: responsive.backCircleSize,
                borderRadius: responsive.backCircleSize / 2,
              }]}>
                <Ionicons name="chevron-back" size={responsive.backIconSize} color="#444" />
              </View>
            </TouchableOpacity>

            {/* MAIN FORM - centered vertically */}
            <View style={[styles.content, {
              paddingHorizontal: responsive.horizontalPadding * 2,
            }]}>
              <Text style={[styles.header, {
                fontSize: width < 405 ? 28 : width >= 440 && width < 600 ? 36 : 32,
                marginBottom: responsive.verticalPadding * 1.5,
                lineHeight: width < 405 ? 34 : width >= 440 && width < 600 ? 44 : 38,
              }]}>
                Create your{'\n'}NexoLink account
              </Text>

              {/* Email */}
              <View style={[styles.inputContainer, {
                marginBottom: responsive.marginBottom + 4,
              }]}>
                <Text style={[styles.inputLabel, {
                  fontSize: width < 405 ? 13 : 14,
                  marginBottom: responsive.marginBottom / 2,
                }]}>Email</Text>
                <View style={[styles.inputWrapper, {
                  borderRadius: responsive.borderRadius + 1,
                  paddingHorizontal: responsive.horizontalPadding,
                  height: width < 405 ? 44 : width >= 440 && width < 600 ? 52 : 48,
                }]}>
                  <Ionicons
                    name="mail-outline"
                    size={width < 405 ? 18 : 20}
                    color="#888"
                    style={[styles.inputIcon, {
                      marginRight: responsive.horizontalPadding / 2,
                    }]}
                  />
                  <TextInput
                    style={[styles.input, {
                      fontSize: width < 405 ? 15 : 16,
                    }]}
                    placeholder="you@example.com"
                    placeholderTextColor="#AAA"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={[styles.inputContainer, {
                marginBottom: responsive.marginBottom + 4,
              }]}>
                <Text style={[styles.inputLabel, {
                  fontSize: width < 405 ? 13 : 14,
                  marginBottom: responsive.marginBottom / 2,
                }]}>Password</Text>
                <View style={[styles.inputWrapper, {
                  borderRadius: responsive.borderRadius + 1,
                  paddingHorizontal: responsive.horizontalPadding,
                  height: width < 405 ? 44 : width >= 440 && width < 600 ? 52 : 48,
                }]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={width < 405 ? 18 : 20}
                    color="#888"
                    style={[styles.inputIcon, {
                      marginRight: responsive.horizontalPadding / 2,
                    }]}
                  />
                  <TextInput
                    style={[styles.input, {
                      fontSize: width < 405 ? 15 : 16,
                    }]}
                    placeholder="••••••••"
                    placeholderTextColor="#AAA"
                    secureTextEntry={!isVisible}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setIsVisible(v => !v)}
                    style={{ marginLeft: responsive.horizontalPadding / 2 }}
                  >
                    <Ionicons
                      name={isVisible ? 'eye-outline' : 'eye-off-outline'}
                      size={width < 405 ? 18 : 20}
                      color="#888"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* REGISTER BUTTON */}
              <TouchableOpacity
                onPress={handleRegister}
                activeOpacity={0.8}
                style={[styles.loginButton, {
                  borderRadius: responsive.borderRadius + 1,
                  height: width < 405 ? 46 : width >= 440 && width < 600 ? 54 : 50,
                  marginBottom: responsive.marginBottom + 4,
                }]}
              >
                <Text style={[styles.loginText, {
                  fontSize: width < 405 ? 15 : 16,
                }]}>REGISTER</Text>
              </TouchableOpacity>

              {/* LOGIN PROMPT */}
              <View style={styles.signupContainer}>
                <Text style={[styles.signupText, {
                  fontSize: width < 405 ? 13 : 14,
                }]}>Already have an account?</Text>
                <TouchableOpacity onPress={() => nav.navigate('Login')}>
                  <Text style={[styles.signupLink, {
                    fontSize: width < 405 ? 13 : 14,
                  }]}> Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  topRightBlob: {
    position: 'absolute',
    top: -height * 0.15,
    right: -width * 0.3,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: 'rgba(200,230,255,0.3)',
    zIndex: 0,
  },
  bottomLeftBlob: {
    position: 'absolute',
    bottom: -height * 0.15,
    left: -width * 0.3,
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: (width * 0.75) / 2,
    backgroundColor: 'rgba(255,230,200,0.3)',
    zIndex: 0,
  },
  diagonalImage: {
    position: 'absolute',
    width: width * 1.4,
    height: width * 1.4,
    top: height * 0.2,
    left: width * 0.5,
    opacity: 0.15,
    transform: [{ rotate: '45deg' }],
    zIndex: 1,
  },
  diagonalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  backButton: {
    position: 'absolute',
    zIndex: 10,
  },
  backCircle: {
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    justifyContent: 'center',         // <-- center vertically
    zIndex: 3,
  },
  header: {
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
  },
  inputLabel: {
    color: '#555',
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
  },
  input: {
    flex: 1,
    color: '#333',
    paddingVertical: 0,
  },
  loginButton: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  loginText: {
    color: '#FFF',
    fontWeight: '700',
    letterSpacing: 1,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#666',
  },
  signupLink: {
    color: '#333',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});