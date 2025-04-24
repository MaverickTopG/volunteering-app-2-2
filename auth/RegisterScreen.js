import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from './AuthContext';

/* ---------- helpers ---------- */
const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const scale  = (s) => (width  / guidelineBaseWidth)  * s;
const vScale = (s) => (height / guidelineBaseHeight) * s;

/* ---------- component ---------- */
export default function RegisterScreen() {
  /* form */
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');

  /* sheet stage & ref */
  const [stage, setStage] = useState('confirm');   // confirm | loading | done
  const sheetRef = useRef(null);

  /* nav / ctx */
  const navigation = useNavigation();
  const { signUp } = React.useContext(AuthContext);

  /* open sheet */
  const openConfirmSheet = () => {
    setStage('confirm');
    sheetRef.current?.snapToIndex(0);   // 0 == first snapPoint
  };

  /* run sign-up */
  const handleOk = async () => {
    setStage('loading');
    const ok = await signUp({ email, password, firstName, lastName });
    setStage(ok ? 'done' : 'confirm');
  };

  /* close helper */
  const closeSheet = () => sheetRef.current?.close();

  /* snap points */
  const snapPoints = ['45%'];

  /* ----------------------------- */
  return (
    <GestureHandlerRootView style={{ flex:1 }}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.inner}
        >
          {/* header */}
          <LinearGradient
            colors={['rgba(255,240,212,0.8)','rgba(255,232,201,0.8)']}
            style={styles.header}
          >
            <Text style={styles.title}>Create Account</Text>
          </LinearGradient>

          {/* form */}
          <View style={styles.form}>
            {[
              { v:firstName,s:setFirstName,p:'First Name' },
              { v:lastName, s:setLastName, p:'Last Name'  },
              { v:email,    s:setEmail,    p:'Email',    props:{ keyboardType:'email-address', autoCapitalize:'none' } },
              { v:password, s:setPassword, p:'Password', props:{ secureTextEntry:true } },
            ].map((f,i)=>(
              <View key={i} style={styles.inputBox}>
                <TextInput
                  value={f.v}
                  onChangeText={f.s}
                  placeholder={f.p}
                  placeholderTextColor="#aaa"
                  style={styles.input}
                  {...(f.props||{})}
                />
              </View>
            ))}

            <TouchableOpacity activeOpacity={0.85} onPress={openConfirmSheet}>
              <LinearGradient colors={['#fff0d4','#ffe8c9']} style={styles.mainBtn}>
                <Text style={styles.mainBtnText}>Sign Up</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Already have an account? Log in</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Delete')}>
              <Text style={styles.link}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* ---------------- BottomSheet ---------------- */}
        <BottomSheet
          ref={sheetRef}
          index={-1}                    /* start closed */
          snapPoints={snapPoints}
          enablePanDownToClose={stage !== 'loading'}
          backgroundStyle={styles.sheetBackground}
          handleIndicatorStyle={{ backgroundColor:'#ccc' }}
        >
          <BottomSheetView style={styles.sheetContent}>
          

            {/* confirm */}
            {stage === 'confirm' && (
              <>
                <Text style={styles.sheetTitle}>
                  {`Hi ${firstName || 'there'}!`}
                </Text>
                <Text style={styles.sheetMsg}>
                  Press OK to create your account. We’ll send a verification e-mail to&nbsp;
                  <Text style={{ fontWeight:'600' }}>{email}</Text>.
                </Text>
                <TouchableOpacity style={styles.blackBtn} onPress={handleOk}>
                  <Text style={[styles.mainBtnText,{ color:'#fff' }]}>OK</Text>
                </TouchableOpacity>
              </>
            )}

            {/* loading */}
            {stage === 'loading' && (
              <View style={{ alignItems:'center' }}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={[styles.sheetMsg,{ marginTop:vScale(18) }]}>
                  Creating your account…
                </Text>
              </View>
            )}

            {/* done */}
            {stage === 'done' && (
              <>
                <Text style={styles.sheetTitle}>All Set!</Text>
                <Text style={styles.sheetMsg}>
                  We’ve emailed&nbsp;
                  <Text style={{ fontWeight:'600' }}>{email}</Text>. Confirm it to begin!
                </Text>
                <TouchableOpacity style={styles.mainBtn} onPress={closeSheet}>
                  <Text style={styles.mainBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </BottomSheetView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#fff6e7' },
  inner:{ flex:1, justifyContent:'center', paddingHorizontal:scale(20) },

  header:{
    marginBottom:vScale(30), paddingVertical:vScale(15), paddingHorizontal:scale(20),
    alignItems:'center', borderRadius:scale(25),
  },
  title:{ fontSize:scale(28), fontWeight:'bold', color:'#333' },

  form:{ marginTop:vScale(20) },
  inputBox:{
    borderColor:'#e1c699', borderWidth:scale(1), borderRadius:scale(25),
    backgroundColor:'#fff6e7', marginBottom:vScale(15),
  },
  input:{ height:vScale(50), paddingHorizontal:scale(20), fontSize:scale(16), color:'#333' },

  mainBtn:{
    backgroundColor:'#ffe8c9', borderRadius:scale(25), paddingVertical:scale(15),
    alignItems:'center', shadowOffset:{ width:0, height:vScale(4) }, shadowOpacity:0.6, elevation:6,
  },
  mainBtnText:{ fontSize:scale(16), fontWeight:'bold', color:'#333' },
  blackBtn:{ backgroundColor:'#000', borderRadius:scale(25), paddingVertical:scale(15), alignItems:'center', marginTop:vScale(24) },
  link:{ color:'#333', textAlign:'center', fontSize:scale(16), marginTop:vScale(10) },

  /* sheet */
  sheetBackground:{ backgroundColor:'#ffe8c9' },
  sheetContent:{ flex:1, paddingHorizontal:scale(24), paddingTop:vScale(32) },
  closeIcon:{ position:'absolute', top:8, left:8, zIndex:10 },
  sheetTitle:{ fontSize:scale(24), fontWeight:'bold', marginBottom:vScale(12), color:'#333' },
  sheetMsg:{ fontSize:scale(16), lineHeight:vScale(22), color:'#333' },
});
