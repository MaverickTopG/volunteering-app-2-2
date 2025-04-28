// SuggestOrganizationScreen.js
import React, { useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../auth/AuthContext';
import { db } from '../../auth/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { themePacks, seasonal } from '../screens/shop';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const scale = size => (width  / guidelineBaseWidth)  * size;
const verticalScale = size => (height / guidelineBaseHeight) * size;

// Default palette: [bg, header-start, header-end, text/icon]
const DEFAULT_PALETTE = ['#FFF6E7', '#FFF0D4', '#FFE8C9', '#333333'];

export default function SuggestOrganizationScreen() {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  const [form, setForm] = useState({
    name: '', description: '', location: '',
    requirements: '', contact: '', website: '',
    county: '', reference: '',
  });
  const [submissionMessage, setSubmissionMessage] = useState('');

  // Reload theme on focus
  useFocusEffect(useCallback(() => {
    if (!user) {
      setPalette(DEFAULT_PALETTE);
      return;
    }
    const key = `@shop/active-${user.uid}`;
    AsyncStorage.getItem(key)
      .then(id => {
        if (!id) {
          setPalette(DEFAULT_PALETTE);
          return;
        }
        const pack =
          themePacks.find(t => t.id === id) ||
          seasonal.find(s => s.id === id);
        if (pack?.colors) {
          const c = pack.colors;
          setPalette([
            c[0] ?? DEFAULT_PALETTE[0],
            c[1] ?? DEFAULT_PALETTE[1],
            c[2] ?? DEFAULT_PALETTE[2],
            c[3] ?? DEFAULT_PALETTE[3],
          ]);
        }
      })
      .catch(() => setPalette(DEFAULT_PALETTE));
  }, [user]));

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: palette[0] }]}>
        <View style={styles.notLoggedInContainer}>
          <Text style={[styles.notLoggedInText, { color: palette[3] }]}>
            You must be logged in to suggest an organization.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    const { name, location, contact, website } = form;
    if (!name || !location || !contact) {
      Alert.alert('Validation Error', 'Please fill in Name, Location, and Contact Information.');
      return;
    }
    if (website && !/^https?:\/\//.test(website)) {
      Alert.alert('Validation Error', 'Please provide a valid website URL.');
      return;
    }
    try {
      await addDoc(collection(db, 'suggested_orgs'), {
        ...form,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
      });
      setForm({ name:'',description:'',location:'',requirements:'',
                contact:'',website:'',county:'',reference:'' });
      setSubmissionMessage(
        'Thank you! Your suggestion has been submitted. It will appear once approved.'
      );
      setTimeout(() => setSubmissionMessage(''), 5000);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to submit.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: palette[0] }]}>
      <KeyboardAvoidingView
        style={{ flex:1, width:'100%' }}
        behavior={Platform.OS==='ios'?'padding':'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={[styles.title, { color: palette[3] }]}>
            Suggest an Organization
          </Text>
          <Text style={[styles.subtitle, { color: palette[3] }]}>
            Help us expand our database! Fill out the form below.
          </Text>

          <View style={[styles.formCard, { backgroundColor: palette[0] }]}>
            <TextInput
              style={styles.input}
              placeholder="Organization Name *"
              placeholderTextColor={palette[3] + '80'}
              value={form.name}
              onChangeText={t=>setForm(f=>({ ...f, name:t }))}
            />
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Description"
              placeholderTextColor={palette[3] + '80'}
              multiline value={form.description}
              onChangeText={t=>setForm(f=>({ ...f, description:t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Location *"
              placeholderTextColor={palette[3] + '80'}
              value={form.location}
              onChangeText={t=>setForm(f=>({ ...f, location:t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Requirements"
              placeholderTextColor={palette[3] + '80'}
              value={form.requirements}
              onChangeText={t=>setForm(f=>({ ...f, requirements:t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Contact Info *"
              placeholderTextColor={palette[3] + '80'}
              value={form.contact}
              onChangeText={t=>setForm(f=>({ ...f, contact:t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Website"
              placeholderTextColor={palette[3] + '80'}
              value={form.website}
              onChangeText={t=>setForm(f=>({ ...f, website:t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="County"
              placeholderTextColor={palette[3] + '80'}
              value={form.county}
              onChangeText={t=>setForm(f=>({ ...f, county:t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Category"
              placeholderTextColor={palette[3] + '80'}
              value={form.reference}
              onChangeText={t=>setForm(f=>({ ...f, reference:t }))}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <LinearGradient
                colors={[palette[1], palette[2]]}
                start={{ x:0,y:0 }} end={{ x:1,y:0 }}
                style={styles.gradientButton}
              >
                <Text style={[styles.submitButtonText, { color: palette[3] }]}>
                  Submit Organization
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {submissionMessage ? (
              <View style={[styles.messageBox, { backgroundColor: palette[0], borderColor: palette[3] }]}>
                <Text style={[styles.messageText, { color: palette[3] }]}>
                  {submissionMessage}
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex:1 },
  scrollContainer:  { padding: scale(20), alignItems:'center' },
  notLoggedInContainer:{ flex:1,justifyContent:'center',alignItems:'center' },
  notLoggedInText:  { fontSize:scale(18), textAlign:'center' },

  title:            { fontSize:scale(26), fontWeight:'bold', marginTop:verticalScale(20), marginBottom:verticalScale(10), textAlign:'center' },
  subtitle:         { fontSize:scale(16), marginBottom:verticalScale(20), textAlign:'center', paddingHorizontal:scale(20) },

  formCard:         { width:'100%', borderRadius:scale(12), padding:scale(20),
                      shadowColor:'#000', shadowOffset:{width:0,height:verticalScale(2)},
                      shadowOpacity:0.1, shadowRadius:scale(4), elevation:4 },

  input:            { borderWidth:scale(1), borderColor:'#ccc', borderRadius:scale(8),
                      fontSize:scale(15), padding:scale(12), marginBottom:verticalScale(12), width:'100%' },
  multiline:        { height:verticalScale(80), textAlignVertical:'top' },

  submitButton:     { marginTop:verticalScale(8) },
  gradientButton:   { borderRadius:scale(8), paddingVertical:verticalScale(14), alignItems:'center', elevation:3 },
  submitButtonText:{ fontSize:scale(16), fontWeight:'bold' },

  messageBox:       { marginTop:verticalScale(16), padding:scale(12), borderRadius:scale(8), borderWidth:scale(1) },
  messageText:      { fontSize:scale(15), textAlign:'center' },
});
