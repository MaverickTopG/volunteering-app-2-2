import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  TextInput,
  Platform,
  Dimensions,
} from 'react-native';
import { AuthContext } from '../../auth/AuthContext';  // Adjust the path as needed
import { db } from '../../auth/firebase';             // your firebase config/export
import { collection, addDoc } from 'firebase/firestore';

// Define baseline dimensions (iPhone 16 Pro Max as an example)
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

export default function SuggestOrganizationScreen() {
  const { user } = useContext(AuthContext);

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

  // If user is not logged in, display a prompt to log in
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

  // Submit handler
  const handleSubmit = async () => {
    const { name, description, location, requirements, contact, website, county, reference } = form;

    // Check required fields
    if (
      !name ||
      !description ||
      !location ||
      !requirements ||
      !contact ||
      !website ||
      !county ||
      !reference
    ) {
      Alert.alert('Validation Error', 'Please fill in all required fields (marked with *).');
      return;
    }

    // Basic website URL validation
    if (!website.startsWith('http://') && !website.startsWith('https://')) {
      Alert.alert('Validation Error', 'Please provide a valid website URL (starting with http:// or https://).');
      return;
    }

    try {
      // Add to Firestore in a "suggested_orgs" collection
      await addDoc(collection(db, 'suggested_orgs'), {
        ...form,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
      });

      // Clear the form
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

      // Show success message
      setSubmissionMessage(
        'Thank you! Your suggestion has been submitted. Once added to the main database, it will appear in the app.'
      );

      // Remove the message after 5 seconds
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
              placeholder="Description *"
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
              placeholder="Requirements *"
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
              placeholder="Website *"
              placeholderTextColor="#555"
              value={form.website}
              onChangeText={(text) => setForm({ ...form, website: text })}
              keyboardAppearance="dark"
            />

            <TextInput
              style={styles.input}
              placeholder="County *"
              placeholderTextColor="#555"
              value={form.county}
              onChangeText={(text) => setForm({ ...form, county: text })}
              keyboardAppearance="dark"
            />

            <TextInput
              style={styles.input}
              placeholder="Which Category *"
              placeholderTextColor="#555"
              value={form.reference}
              onChangeText={(text) => setForm({ ...form, reference: text })}
              keyboardAppearance="dark"
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit Organization</Text>
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
    backgroundColor: '#fff6e7',
  },
  scrollContainer: {
    padding: scale(20),
    alignItems: 'center',
  },
  notLoggedInContainer: {
    flex: 1,
    backgroundColor: '#fff6e7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
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
    backgroundColor: '#fff6e7',
    borderRadius: scale(12),
    padding: scale(20),
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.15,
    shadowRadius: scale(4),
    // Shadow for Android
    elevation: scale(4),
  },
  input: {
    backgroundColor: '#fff6e7',
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
    backgroundColor: '#333',
    borderRadius: scale(8),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  submitButtonText: {
    color: '#fff6e7',
    fontSize: scale(16),
    fontWeight: 'bold',
  },
  messageBox: {
    marginTop: verticalScale(16),
    padding: scale(12),
    backgroundColor: '#fff6e7',
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
