import React, { useState, useContext, useRef, useMemo, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from './AuthContext';

// scaling
const { width, height } = Dimensions.get('window');
const baseW = 428;
const baseH = 926;
const scale = s => (width / baseW) * s;
const vScale = s => (height / baseH) * s;
const PALETTE = ['#FFF6E7', '#FFF0D4', '#FFE8C9', '#333333'];

export default function DeleteScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const { deleteAccount, sendDeletionEmail } = useContext(AuthContext);
  const nav = useNavigation();

  const handleDelete = async () => {
    try {
      await deleteAccount(email, password);
      Alert.alert('Deleted', 'Your account has been deleted.');
    } catch (e) {
      Alert.alert('Error', 'Could not delete. Check your credentials.');
    }
  };

  const handleResend = async () => {
    try {
      await sendDeletionEmail(email);
      Alert.alert('Sent', 'Deletion email resent.');
    } catch {
      Alert.alert('Error', 'Could not resend email.');
    }
  };

  return (
    <GestureHandlerRootView style={{ flex:1 }}>
      <SafeAreaView style={styles.container}>
        {/* Background blobs */}
        <View style={styles.blob1} />
        <View style={styles.blob2} />
        <View style={styles.blob3} />
        <View style={styles.blob4} />

        <KeyboardAvoidingView
          behavior={Platform.OS==='ios' ? 'padding' : undefined}
          style={styles.inner}
        >
          <Text style={styles.header}>Delete Account</Text>

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
              secureTextEntry={!visible}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={()=>setVisible(v=>!v)}>
              <Ionicons
                name={visible?'eye':'eye-off'}
                size={scale(20)}
                color="#aaa"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleDelete} activeOpacity={0.85}>
            <LinearGradient
              colors={['#ff3b3b','#ff6b6b']}
              style={styles.mainBtn}
            >
              <Text style={styles.mainText}>Delete Account</Text>
            </LinearGradient>
          </TouchableOpacity>

    

          <TouchableOpacity onPress={()=>nav.navigate('Login')}>
            <Text style={styles.link}>Cancel and go back</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const B = width * 0.8;
const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:PALETTE[0] },
  blob1:{position:'absolute',top:-B*0.3,left:-B*0.3,width:B,height:B,backgroundColor:PALETTE[2],borderRadius:B/2},
  blob2:{position:'absolute',top:-B*0.2,right:-B*0.4,width:B*1.2,height:B*1.2,backgroundColor:PALETTE[1],borderRadius:B*0.6},
  blob3:{position:'absolute',bottom:-B*0.5,left:-B*0.5,width:B*1.4,height:B,backgroundColor:PALETTE[1],borderRadius:B/2},
  blob4:{position:'absolute',bottom:-B*0.4,right:-B*0.2,width:B,height:B*0.8,backgroundColor:PALETTE[2],borderRadius:B*0.5},
  inner:{flex:1,justifyContent:'center',padding:scale(20)},
  header:{fontSize:scale(28),fontWeight:'700',color:PALETTE[3],textAlign:'center',marginBottom:vScale(24)},
  input:{height:vScale(48),borderWidth:1,borderColor:PALETTE[2],borderRadius:scale(25),paddingHorizontal:scale(20),marginBottom:vScale(16),backgroundColor:PALETTE[0],fontSize:scale(16),color:PALETTE[3]},
  passwordContainer:{flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:PALETTE[2],borderRadius:scale(25),paddingHorizontal:scale(20),marginBottom:vScale(16),height:vScale(48),backgroundColor:PALETTE[0]},
  inputFlex:{flex:1,fontSize:scale(16),color:PALETTE[3]},
  mainBtn:{borderRadius:scale(25),paddingVertical:vScale(14),alignItems:'center',shadowColor:'#ff6b6b',shadowOpacity:0.6,shadowOffset:{width:0,height:vScale(4)},shadowRadius:scale(6),elevation:6,marginBottom:vScale(12)},
  mainText:{color:PALETTE[0],fontSize:scale(16),fontWeight:'700'},
  resendLink:{alignItems:'center',marginBottom:vScale(24)},
  resendText:{color:PALETTE[3],textDecorationLine:'underline',fontSize:scale(14)},
  link:{color:PALETTE[3],textAlign:'center',fontSize:scale(16)},
});
