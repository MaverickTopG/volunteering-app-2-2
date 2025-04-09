import React, { useState, useContext } from 'react';
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
import { AuthContext } from '../../auth/AuthContext'; // Adjust the path as needed
import { db } from '../../auth/firebase';             // your firebase config/export
import { collection, addDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

BACKGROUND = "#fff6e7";

const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

export default function SuggestOrganizationScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const nav = useNavigation();

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    location: '',
    requirements: '',
    contact: '',
    website: '',
    county: '',
    reference: '',
  });

  // Success message state
  const [submissionMessage, setSubmissionMessage] = useState('');

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notLoggedInContainer}>
          <Text style={styles.notLoggedInText}>
            You must be logged in to suggest an organization.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    const { name, location, contact, description, requirements, website, county, reference } = form;

    // Only Name, Location, and Contact are mandatory
    if (!name || !location || !contact) {
      Alert.alert('Validation Error', 'Please fill in Name, Location, and Contact Information.');
      return;
    }

    // Basic website URL validation if provided
    if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
      Alert.alert('Validation Error', 'Please provide a valid website URL (starting with http:// or https://).');
      return;
    }

    try {
      await addDoc(collection(db, 'suggested_orgs'), {
        ...form,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
      });

      setForm({
        name: '',
        description: '',
        location: '',
        requirements: '',
        contact: '',
        website: '',
        county: '',
        reference: '',
      });

      setSubmissionMessage(
        'Thank you! Your suggestion has been submitted. Once added to the main database, it will appear in the app.'
      );

      setTimeout(() => {
        setSubmissionMessage('');
      }, 5000);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit the organization.');
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1, width: '100%' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Suggest an Organization</Text>
          <Text style={styles.subtitle}>
            Help us expand our database! Fill out the form below to suggest a new organization.
          </Text>

          <View style={styles.formCard}>
            <TextInput
              style={styles.input}
              placeholder="Organization Name *"
              placeholderTextColor="#555"
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
              keyboardAppearance="dark"
            />

            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Description"
              placeholderTextColor="#555"
              multiline
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
              keyboardAppearance="dark"
            />

            <TextInput
              style={styles.input}
              placeholder="Location *"
              placeholderTextColor="#555"
              value={form.location}
              onChangeText={(text) => setForm({ ...form, location: text })}
              keyboardAppearance="dark"
            />

            <TextInput
              style={styles.input}
              placeholder="Requirements"
              placeholderTextColor="#555"
              value={form.requirements}
              onChangeText={(text) => setForm({ ...form, requirements: text })}
              keyboardAppearance="dark"
            />

            <TextInput
              style={styles.input}
              placeholder="Contact Information *"
              placeholderTextColor="#555"
              value={form.contact}
              onChangeText={(text) => setForm({ ...form, contact: text })}
              keyboardAppearance="dark"
            />

            <TextInput
              style={styles.input}
              placeholder="Website"
              placeholderTextColor="#555"
              value={form.website}
              onChangeText={(text) => setForm({ ...form, website: text })}
              keyboardAppearance="dark"
            />

            <TextInput
              style={styles.input}
              placeholder="County"
              placeholderTextColor="#555"
              value={form.county}
              onChangeText={(text) => setForm({ ...form, county: text })}
              keyboardAppearance="dark"
            />

            <TextInput
              style={styles.input}
              placeholder="Which Category"
              placeholderTextColor="#555"
              value={form.reference}
              onChangeText={(text) => setForm({ ...form, reference: text })}
              keyboardAppearance="dark"
            />

            {/* Gradient Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <LinearGradient
                colors={['#fff0d4', '#ffe8c9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.submitButtonText}>Submit Organization</Text>
              </LinearGradient>
            </TouchableOpacity>

            {submissionMessage ? (
              <View style={styles.messageBox}>
                <Text style={styles.messageText}>{submissionMessage}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  scrollContainer: {
    padding: scale(20),
    alignItems: 'center',
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notLoggedInText: {
    fontSize: scale(18),
    color: '#333',
    textAlign: 'center',
  },
  title: {
    fontSize: scale(26),
    fontWeight: 'bold',
    color: '#333',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(10),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: scale(16),
    color: '#444',
    marginBottom: verticalScale(20),
    textAlign: 'center',
    paddingHorizontal: scale(20),
  },
  formCard: {
    width: '100%',
    backgroundColor: BACKGROUND,
    borderRadius: scale(12),
    padding: scale(20),
    shadowColor: '#ffe8c9',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.3,
    shadowRadius: scale(4),
    elevation: scale(4),
  },
  input: {
    backgroundColor: BACKGROUND,
    borderWidth: scale(1),
    borderColor: '#ccc',
    borderRadius: scale(8),
    color: '#333',
    fontSize: scale(15),
    padding: scale(12),
    marginBottom: verticalScale(12),
    width: '100%',
  },
  multiline: {
    height: verticalScale(80),
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: verticalScale(8),
  },
  gradientButton: {
    borderRadius: scale(8),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(20),
    alignItems: 'center',
    shadowColor: '#ffe8c9',
    shadowOpacity: 0.6,
    shadowRadius: scale(6),
    shadowOffset: { width: 0, height: verticalScale(3) },
    elevation: 6,
  },
  submitButtonText: {
    color: '#333',
    fontSize: scale(16),
    fontWeight: 'bold',
  },
  messageBox: {
    marginTop: verticalScale(16),
    padding: scale(12),
    backgroundColor: BACKGROUND,
    borderRadius: scale(8),
    borderWidth: scale(1),
    borderColor: '#333',
  },
  messageText: {
    color: '#333',
    fontSize: scale(15),
    textAlign: 'center',
  },
});
