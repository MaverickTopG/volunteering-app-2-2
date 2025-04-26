import React, { useState, useContext, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AuthContext } from './AuthContext';

/* ------------- scaling helpers ------------- */
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get('window');
const scale  = (s) => (width  / guidelineBaseWidth)  * s;
const vScale = (s) => (height / guidelineBaseHeight) * s;

export default function LoginScreen() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [fpStage, setFpStage] = useState('form');
  const [fpEmail, setFpEmail] = useState('');
  const fpSheetRef = useRef(null);
  const fpSnapPts = useMemo(() => ['45%', '100%'], []);

  const { signIn, resetPassword } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      await signIn(email, password);
      Alert.alert('Login Successful', 'You are now logged in.');
    } catch {
      Alert.alert('Login Failed', 'Please check your credentials and try again.');
    }
  };

  const openForgotSheet = () => {
    setFpStage('form');
    setFpEmail('');
    fpSheetRef.current?.snapToIndex(0);
  };

  const sendReset = async () => {
    if (!fpEmail) return Alert.alert('Enter e-mail', 'Please type your e-mail.');
    setFpStage('loading');
    const ok = await resetPassword(fpEmail);
    setFpStage(ok ? 'done' : 'form');
  };

  const closeSheet = () => fpSheetRef.current?.close();

  return (
    <GestureHandlerRootView style={{ flex:1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          <LinearGradient
            colors={['rgba(255,240,212,0.8)','rgba(255,232,201,0.8)']}
            style={styles.headerContainer}
          >
            <Text style={styles.headerText}>Volunteer Logs</Text>
          </LinearGradient>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              keyboardAppearance="dark"
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                keyboardAppearance="dark"

              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(v => !v)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={isPasswordVisible ? 'eye' : 'eye-off'}
                  size={scale(20)}
                  color="#aaa"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleLogin} activeOpacity={0.85}>
              <LinearGradient colors={['#fff0d4','#ffe8c9']} style={styles.button}>
                <Text style={styles.buttonText}>Login</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={openForgotSheet}>
              <Text style={styles.linkText}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>Don't have an account? Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>

        <BottomSheet
          ref={fpSheetRef}
          index={-1}
          snapPoints={fpSnapPts}
          enablePanDownToClose={fpStage !== 'loading'}
          backdropComponent={() => null}
          backgroundStyle={{ backgroundColor:'#ffe8c9' }}
          handleIndicatorStyle={{ backgroundColor:'#ccc' }}
          keyboardBehavior="interactive"
          keyboardInputMode={Platform.OS === 'android' ? 'adjustResize' : undefined}
        >
          <BottomSheetView style={{ flex: 1 }}>
            <KeyboardAwareScrollView
              contentContainerStyle={styles.sheetContent}
              enableOnAndroid
              extraScrollHeight={vScale(20)}
            >
              {fpStage === 'form' && (
                <>
                  <Text style={styles.sheetTitle}>Forgot Password</Text>
                  <Text style={styles.sheetMsg}>
                    Enter your account e-mail and we’ll send you a reset link.
                  </Text>
                  <TextInput
                    style={styles.sheetInput}
                    placeholder="Email"
                    placeholderTextColor="#aaa"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={fpEmail}
                    keyboardAppearance="dark"
                    onChangeText={setFpEmail}
                    onFocus={() => fpSheetRef.current?.snapToIndex(1)}
                    onBlur={() => fpSheetRef.current?.snapToIndex(0)}
                  />
                  <TouchableOpacity style={styles.blackBtn} onPress={sendReset}>
                    <Text style={[styles.buttonText, { color:'#fff' }]}>OK</Text>
                  </TouchableOpacity>
                </>
              )}

              {fpStage === 'loading' && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#000" />
                  <Text style={[styles.sheetMsg, { marginTop: vScale(18) }]}>Sending reset link…</Text>
                </View>
              )}

              {fpStage === 'done' && (
                <>
                  <Text style={styles.sheetTitle}>Check your inbox!</Text>
                  <Text style={styles.sheetMsg}>
                    We sent a reset link to{' '}
                    <Text style={{ fontWeight:'600' }}>{fpEmail}</Text>.
                  </Text>
                  <TouchableOpacity style={styles.button} onPress={closeSheet}>
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </KeyboardAwareScrollView>
          </BottomSheetView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#fff6e7' },
  contentContainer: { flex:1, justifyContent:'center', paddingHorizontal: scale(20) },
  headerContainer: {
    marginBottom: vScale(30),
    paddingVertical: vScale(15),
    paddingHorizontal: scale(20),
    borderRadius: scale(25),
    alignItems:'center',
    shadowColor:'#ffe8c9',
    shadowOffset:{ width:0, height: scale(4) },
    shadowOpacity:0.6,
    shadowRadius: scale(6),
    elevation:6,
  },
  headerText: { fontSize: scale(28), fontWeight:'bold', color:'#333' },
  inputContainer: { marginTop: vScale(20) },
  input: {
    height: vScale(50),
    backgroundColor:'#fff6e7',
    borderColor:'#e1c699',
    borderWidth: scale(1),
    borderRadius: scale(25),
    paddingHorizontal: scale(20),
    fontSize: scale(16),
    color:'#333',
    marginBottom: vScale(15),
  },
  passwordContainer: {
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#fff6e7',
    borderColor:'#e1c699',
    borderWidth: scale(1),
    borderRadius: scale(25),
    marginBottom: vScale(15),
    height: vScale(50),
    paddingHorizontal: scale(20),
  },
  passwordInput: { flex:1, fontSize: scale(16), color:'#333' },
  eyeIcon: { padding: scale(5) },
  button: {
    borderRadius: scale(25),
    paddingVertical: scale(15),
    alignItems:'center',
    shadowColor:'#ffe8c9',
    shadowOpacity:0.6,
    shadowRadius: scale(6),
    shadowOffset:{ width:0, height: scale(4) },
    elevation:6,
    marginTop: vScale(10),
    marginBottom: vScale(20),
  },
  buttonText: { color:'#333', fontSize: scale(16), fontWeight:'bold' },
  linkText: { color:'#333', textAlign:'center', fontSize: scale(16), marginTop: vScale(10) },
  sheetContent: { flexGrow:1, paddingHorizontal: scale(24), paddingTop: vScale(32), justifyContent:'flex-start' },
  sheetTitle: { fontSize: scale(24), fontWeight:'bold', marginBottom: vScale(12), color:'#333' },
  sheetMsg: { fontSize: scale(16), lineHeight: vScale(22), color:'#333' },
  sheetInput: {
    height: vScale(48),
    borderColor:'#e1c699',
    borderWidth: scale(1),
    borderRadius: scale(25),
    paddingHorizontal: scale(20),
    fontSize: scale(16),
    color:'#333',
    backgroundColor:'#fff6e7',
    marginTop: vScale(12),
  },
  blackBtn: { backgroundColor:'#000', borderRadius: scale(25), paddingVertical: scale(15), alignItems:'center', marginTop: vScale(24) },
  loadingContainer: { alignItems:'center' },
});
