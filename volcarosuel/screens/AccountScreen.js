import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../auth/firebase'; // Adjust path to your firebase.js
import { AuthContext } from '../../auth/AuthContext'; // Adjust the path to your AuthContext
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

/* ===================== AccountScreen Component ===================== */
function AccountScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  // If no user is logged in, show a prompt.
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notLoggedInContainer}>
          <Text style={styles.notLoggedInText}>
            You must be logged in to view your account.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <TouchableOpacity
            style={styles.row}
            onPress={() => Linking.openURL('https://mavericktopg.github.io/privacy_policy.html')}
          >
            <Text style={styles.rowText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('AboutNexolinkScreen')}
          >
            <Text style={styles.rowText}>About Nexolink</Text>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ===================== AboutNexolinkScreen Component ===================== */
function AboutNexolinkScreen({ navigation }) {
  return (
    <SafeAreaView style={aboutStyles.container}>
      <TouchableOpacity 
        style={aboutStyles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={aboutStyles.scrollContent}>
        <Text style={aboutStyles.header}>About Nexolink</Text>
        <Text style={aboutStyles.bodyText}>
          Welcome to Nexolink! We believe that volunteering is the heart of community connection.
          Nexolink is dedicated to bridging passionate volunteers with organizations that need them
          most. Our mission is to create a vibrant network where every act of kindness makes a difference.
          Thank you for joining us in making the world a better place.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ===================== Stack Navigator ===================== */
const Stack = createStackNavigator();

export default function AccountStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountScreen" component={AccountScreen} />
      <Stack.Screen name="AboutNexolinkScreen" component={AboutNexolinkScreen} />
    </Stack.Navigator>
)}

/* ===================== Styles for AccountScreen ===================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7',
  },
  scrollContent: {
    padding: 16,
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notLoggedInText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  row: {
    backgroundColor: '#fff6e7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  rowText: {
    fontSize: 14,
    color: '#333',
  },
});

/* ===================== Styles for AboutNexolinkScreen ===================== */
const aboutStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7',
  },
  backButton: {
    position: 'absolute',
    top: -10,
    left: 5,
    zIndex: 1,
    padding: 10,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50, // Ensure space for the back button
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  bodyText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'center',
  },
});
