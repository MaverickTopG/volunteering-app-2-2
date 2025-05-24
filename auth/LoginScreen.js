import React, { useState, useContext, useRef, useMemo, useEffect } from 'react';
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

// scaling helpers
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get('window');
const scale  = s => (width  / guidelineBaseWidth)  * s;
const vScale = s => (height / guidelineBaseHeight) * s;
const PALETTE = ['#FFF6E7', '#FFF0D4', '#FFE8C9', '#333333'];

export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const [fpStage, setFpStage]   = useState('form');
  const [fpEmail, setFpEmail]   = useState('');
  const [canResend, setCanResend] = useState(false);
  const fpSheetRef = useRef(null);
  const fpSnapPts = useMemo(() => ['45%', '100%'], []);

  const { signIn, resetPassword } = useContext(AuthContext);
  const nav = useNavigation();

  // Resend timer
  useEffect(() => {
    if (fpStage === 'done') {
      setCanResend(false);
      const timer = setTimeout(() => setCanResend(true), 10000);
      return () => clearTimeout(timer);
    }
  }, [fpStage]);

  const handleLogin = async () => {
    try {
      await signIn(email, password);
      Alert.alert('Success', 'Logged in successfully.');
    } catch {
      Alert.alert('Error', 'Invalid credentials.');
    }
  };

  const openForgot = () => {
    setFpStage('form');
    setFpEmail('');
    fpSheetRef.current?.snapToIndex(0);
  };

  const sendReset = async () => {
    if (!fpEmail) return Alert.alert('Error', 'Please enter email.');
    setFpStage('loading');
    const ok = await resetPassword(fpEmail);
    if (!ok) {
      Alert.alert('Error', 'Failed to send. Please try again.');
      setFpStage('form');
    } else {
      setFpStage('done');
    }
  };

  const closeSheet = () => fpSheetRef.current?.close();

  return (
    <GestureHandlerRootView style={{ flex:1 }}>
      <SafeAreaView style={styles.container}>
        {/* four organic blobs */}
        <View style={styles.blob1} />
        <View style={styles.blob2} />
        <View style={styles.blob3} />
        <View style={styles.blob4} />

        <View style={styles.content}>
          <Text style={styles.header}>Login</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.inputFlex}
              placeholder="Password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isVisible}
            />
            <TouchableOpacity onPress={() => setIsVisible(v=>!v)}>
              <Ionicons name={isVisible?'eye':'eye-off'} size={scale(20)} color="#aaa" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleLogin} activeOpacity={0.85}>
            <LinearGradient colors={[PALETTE[1],PALETTE[2]]} style={styles.submitBtn}>
              <Text style={styles.submitText}>Submit</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={openForgot}>
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => nav.navigate('Register')}>
            <Text style={styles.link}>Don't have an account? Sign up</Text>
          </TouchableOpacity>
        </View>

        <BottomSheet
          ref={fpSheetRef}
          index={-1}
          snapPoints={fpSnapPts}
          enablePanDownToClose={fpStage!=='loading'}
          backgroundStyle={{ backgroundColor: PALETTE[1] }}
        >
          <BottomSheetView style={styles.sheet}>
            <KeyboardAwareScrollView contentContainerStyle={styles.sheetInner}>
              {fpStage==='form' && (
                <>                
                  <Text style={styles.sheetTitle}>Reset Password</Text>
                  <Text style={styles.sheetMsg}>Enter your email and we'll send a link.</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#aaa"
                    value={fpEmail}
                    onChangeText={setFpEmail}
                    onFocus={()=>fpSheetRef.current?.snapToIndex(1)}
                    onBlur={()=>fpSheetRef.current?.snapToIndex(0)}
                  />
                  <TouchableOpacity style={styles.submitBtn} onPress={sendReset}>
                    <Text style={styles.submitText}>Send</Text>
                  </TouchableOpacity>
                </>
              )}
              {fpStage==='loading' && (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator size="large" color="#333" />
                  <Text style={styles.sheetMsg}>Sending...</Text>
                </View>
              )}
              {fpStage==='done' && (
                <>                
                  <Text style={styles.sheetTitle}>Check your inbox!</Text>
                  <Text style={styles.sheetMsg}>A link was sent to <Text style={{fontWeight:'600'}}>{fpEmail}</Text>.</Text>
                  {canResend && (
                    <TouchableOpacity style={styles.resendBtn} onPress={sendReset}>
                      <Text style={styles.resendText}>Resend Email</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.submitBtn} onPress={closeSheet}>
                    <Text style={styles.submitText}>Close</Text>
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

const BLOB = width * 0.8;
const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:PALETTE[0] },
  blob1:{position:'absolute',top:-BLOB*0.3,left:-BLOB*0.3,width:BLOB,height:BLOB,backgroundColor:PALETTE[2],borderRadius:BLOB/2},
  blob2:{position:'absolute',top:-BLOB*0.4,right:-BLOB*0.4,width:BLOB*1.2,height:BLOB*1.2,backgroundColor:PALETTE[1],borderRadius:BLOB*0.6},
  blob3:{position:'absolute',bottom:-BLOB*0.5,left:-BLOB*0.5,width:BLOB*1.5,height:BLOB,backgroundColor:PALETTE[1],borderRadius:BLOB/2},
  blob4:{position:'absolute',bottom:-BLOB*0.4,right:-BLOB*0.3,width:BLOB,height:BLOB*0.8,backgroundColor:PALETTE[2],borderRadius:BLOB*0.5},
  content:{flex:1,justifyContent:'center',padding:scale(20)},
  header:{fontSize:scale(28),fontWeight:'700',color:PALETTE[3],textAlign:'center',marginBottom:vScale(24)},
  input:{height:vScale(48),backgroundColor:PALETTE[0],borderColor:PALETTE[2],borderWidth:1,paddingHorizontal:scale(16),borderRadius:scale(24),fontSize:scale(16),color:PALETTE[3],marginBottom:vScale(16)},
  passwordContainer:{flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:PALETTE[2],borderRadius:scale(24),paddingHorizontal:scale(16),marginBottom:vScale(16),height:vScale(48),backgroundColor:PALETTE[0]},
  inputFlex:{flex:1,fontSize:scale(16),color:PALETTE[3]},
  submitBtn:{borderRadius:scale(24),paddingVertical:vScale(14),alignItems:'center',backgroundColor:PALETTE[2],marginBottom:vScale(16)},
  submitText:{color:PALETTE[3],fontSize:scale(16),fontWeight:'600'},
  link:{color:PALETTE[3],textAlign:'center',fontSize:scale(14),marginBottom:vScale(8)},
  sheet:{flex:1,backgroundColor:PALETTE[1]},
  sheetInner:{flexGrow:1,padding:scale(20)},
  sheetTitle:{fontSize:scale(22),fontWeight:'700',color:PALETTE[3],marginBottom:vScale(12)},
  sheetMsg:{fontSize:scale(16),color:PALETTE[3],marginBottom:vScale(16)},
  loadingWrap:{alignItems:'center',marginTop:vScale(20)},
  resendBtn:{alignSelf:'center',padding:vScale(8),marginBottom:vScale(16)},
  resendText:{color:PALETTE[3],textDecorationLine:'underline',fontSize:scale(14)},
});
