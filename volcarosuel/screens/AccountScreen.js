import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Linking, 
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

// Define baseline dimensions (iPhone 16 Pro Max as an example)
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

/* ===================== AccountScreen Component ===================== */
function AccountScreen({ navigation }) {
  // For this example, we assume user is logged in.
  // In your actual code, you would get the user from AuthContext.
  const user = { uid: 'example' };

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
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#fff0d4', '#ffe8c9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerContainer}
        >
          <Text style={styles.headerText}>About</Text>
        </LinearGradient>

        {/* About Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => Linking.openURL('https://mavericktopg.github.io/privacy_policy.html')}
          >
            <Text style={styles.rowText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={scale(20)} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('AboutNexolinkScreen')}
          >
            <Text style={styles.rowText}>About Nexolink</Text>
            <Ionicons name="chevron-forward" size={scale(20)} color="#333" />
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
        <Ionicons name="arrow-back" size={scale(24)} color="#333" />
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
  );
}

/* ===================== Styles for AccountScreen ===================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7',
  },
  scrollContent: {
    padding: scale(16),
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
  headerContainer: {
    marginBottom: verticalScale(20),
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(20),
    borderRadius: scale(25),
    alignItems: 'center',
    // Soft shadow matching the gradient
    shadowColor: '#ffe8c9',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.6,
    shadowRadius: scale(6),
    elevation: 6,
  },
  headerText: {
    fontSize: scale(28),
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: verticalScale(20),
  },
  sectionTitle: {
    fontSize: scale(16),
    color: '#333',
    marginBottom: verticalScale(10),
    fontWeight: 'bold',
  },
  row: {
    backgroundColor: '#fff6e7',
    padding: scale(12),
    borderRadius: scale(8),
    marginBottom: verticalScale(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: scale(1),
    borderColor: '#ccc',
    // Subtle shadow for depth
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.3,
    shadowRadius: scale(4),
    elevation: 2,
  },
  rowText: {
    fontSize: scale(14),
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
    top: verticalScale(10),
    left: scale(10),
    zIndex: 1,
    padding: scale(10),
  },
  scrollContent: {
    padding: scale(20),
    paddingTop: verticalScale(60), // Space for back button
  },
  header: {
    fontSize: scale(26),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: verticalScale(20),
    textAlign: 'center',
  },
  bodyText: {
    fontSize: scale(16),
    color: '#333',
    lineHeight: scale(24),
    textAlign: 'center',
  },
});
