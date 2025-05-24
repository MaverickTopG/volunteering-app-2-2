import React, { useState, useRef, useContext, useMemo, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from './AuthContext';

// Helpers
const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const scale = s => (width / guidelineBaseWidth) * s;
const vScale = s => (height / guidelineBaseHeight) * s;
const PALETTE = ['#FFF6E7', '#FFF0D4', '#FFE8C9', '#333333'];

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stage, setStage] = useState('confirm'); // confirm | loading | done
  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ['45%', '80%'], []);
  const { signUp } = useContext(AuthContext);
  const navigation = useNavigation();
  
  const openSheet = () => {
    setStage('confirm');
    sheetRef.current?.snapToIndex(0);
  };

  const handleOk = async () => {
    setStage('loading');
    const ok = await signUp({ firstName, lastName, email, password });
    setStage(ok ? 'done' : 'confirm');
  };

  const closeSheet = () => sheetRef.current?.close();

  // Enable resend after 10s when done
  const [canResend, setCanResend] = useState(false);
  useEffect(() => {
    if (stage === 'done') {
      setCanResend(false);
      const t = setTimeout(() => setCanResend(true), 10000);
      return () => clearTimeout(t);
    }
  }, [stage]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* organic shapes */}
        <View style={styles.blobA} />
        <View style={styles.blobB} />
        <View style={styles.blobC} />
        <View style={styles.blobD} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.inner}
        >
          <LinearGradient
            colors={['rgba(255,232,201,0.8)', 'rgba(255,240,212,0.8)']}
            style={styles.header}
          >
            <Text style={styles.title}>Create Account</Text>
          </LinearGradient>

          <View style={styles.form}>
            {[
              { value: firstName, setter: setFirstName, placeholder: 'First Name' },
              { value: lastName, setter: setLastName, placeholder: 'Last Name' },
              { value: email, setter: setEmail, placeholder: 'Email', props: { keyboardType: 'email-address', autoCapitalize: 'none' } },
              { value: password, setter: setPassword, placeholder: 'Password', props: { secureTextEntry: true } },
            ].map((fld, i) => (
              <View key={i} style={styles.inputBox}>
                <TextInput
                  value={fld.value}
                  onChangeText={fld.setter}
                  placeholder={fld.placeholder}
                  placeholderTextColor="#aaa"
                  style={styles.input}
                  {...(fld.props || {})}
                />
              </View>
            ))}

            <TouchableOpacity activeOpacity={0.85} onPress={openSheet}>
              <LinearGradient colors={[PALETTE[1], PALETTE[2]]} style={styles.submitBtn}>
                <Text style={styles.submitText}>Sign Up</Text>
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

        <BottomSheet
          ref={sheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={stage !== 'loading'}
          backgroundStyle={styles.sheetBackground}
          handleIndicatorStyle={styles.handleIndicator}
          backdropComponent={() => <View style={styles.backdrop} />}
        >
          <BottomSheetView style={styles.sheetContent}>
            {stage === 'confirm' && (
              <>
                <Text style={styles.sheetTitle}>Hi {firstName || 'there'}!</Text>
                <Text style={styles.sheetMsg}>
                  Press OK to create your account. We’ll send a verification email to{' '}
                  <Text style={{ fontWeight: '600' }}>{email}</Text>.
                </Text>
                <TouchableOpacity style={styles.okBtn} onPress={handleOk}>
                  <Text style={[styles.submitText, { color: '#fff' }]}>OK</Text>
                </TouchableOpacity>
              </>
            )}
            {stage === 'loading' && (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color="#333" />
                <Text style={styles.sheetMsg}>Creating your account…</Text>
              </View>
            )}
            {stage === 'done' && (
              <>
                <Text style={styles.sheetTitle}>All Set!</Text>
                <Text style={styles.sheetMsg}>
                  We’ve emailed{' '}
                  <Text style={{ fontWeight: '600' }}>{email}</Text>. Confirm it to start!
                </Text>
                {canResend && (
                  <TouchableOpacity style={styles.resendBtn} onPress={handleOk}>
                    <Text style={styles.resendText}>Resend Email</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.submitBtn} onPress={closeSheet}>
                  <Text style={styles.submitText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </BottomSheetView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const B = width * 0.7;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE[0] },
  blobA: { position: 'absolute', top: -B * 0.4, left: -B * 0.3, width: B, height: B, backgroundColor: PALETTE[2], borderRadius: B / 2 },
  blobB: { position: 'absolute', top: -B * 0.2, right: -B * 0.4, width: B * 1.1, height: B * 1.1, backgroundColor: PALETTE[1], borderRadius: B * 0.55 },
  blobC: { position: 'absolute', bottom: -B * 0.5, left: -B * 0.5, width: B * 1.4, height: B, backgroundColor: PALETTE[1], borderRadius: B / 2 },
  blobD: { position: 'absolute', bottom: -B * 0.3, right: -B * 0.2, width: B, height: B * 0.8, backgroundColor: PALETTE[2], borderRadius: B * 0.5 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: scale(20) },
  header: { marginBottom: vScale(30), paddingVertical: vScale(15), alignItems: 'center', borderRadius: scale(25) },
  title: { fontSize: scale(28), fontWeight: '700', color: PALETTE[3] },
  form: { marginTop: vScale(20) },
  inputBox: { borderColor: PALETTE[2], borderWidth: 1, borderRadius: scale(25), backgroundColor: PALETTE[0], marginBottom: vScale(15) },
  input: { height: vScale(48), paddingHorizontal: scale(20), fontSize: scale(16), color: PALETTE[3] },
  submitBtn: { backgroundColor: PALETTE[2], borderRadius: scale(25), paddingVertical: vScale(14), alignItems: 'center', marginBottom: vScale(16) },
  submitText: { fontSize: scale(16), fontWeight: '600', color: PALETTE[3] },
  okBtn: { backgroundColor: '#333', borderRadius: scale(25), paddingVertical: vScale(14), alignItems: 'center', marginTop: vScale(16) },
  link: { color: PALETTE[3], textAlign: 'center', fontSize: scale(14), marginBottom: vScale(10) },
  // BottomSheet styles
  sheetBackground: {
    backgroundColor: PALETTE[1],
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
  },
  handleIndicator: {
    backgroundColor: '#ccc',
    width: scale(80),
    height: scale(6),
    borderRadius: scale(3),
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: scale(24),
    paddingTop: vScale(16),
  },
  sheetInner: {
    flexGrow: 1,
    paddingBottom: vScale(32),
  },
  sheetTitle: {
    fontSize: scale(22),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: vScale(12),
  },
  sheetMsg: {
    fontSize: scale(16),
    textAlign: 'center',
    marginBottom: vScale(16),
  },
  loadingWrap: { alignItems: 'center', marginTop: vScale(20) },
  resendBtn: { alignSelf: 'center', padding: vScale(8), marginBottom: vScale(16) },
  resendText: { color: PALETTE[3], textDecorationLine: 'underline', fontSize: scale(14) },
});
