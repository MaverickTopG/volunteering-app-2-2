import React, { useEffect, useState, useRef } from 'react';
import { Animated, Image, StyleSheet, Platform, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { registerRootComponent } from 'expo';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Example Navigation and AuthContext imports, replace with your actual ones.
import { AuthProvider } from './auth/AuthContext'; 
import DrawerNavigator from './navigation/drawer';  
import AppUpdateChecker from './AppUpdateChecker.js';

// Prevent the native splash screen from auto-hiding.
SplashScreen.preventAutoHideAsync();

// Array of 50 volunteer reminder messages
const messages = [
  "Rise and shine – it's time to volunteer!",
  "Good morning! Let’s make a difference today.",
  "Start your day with kindness—volunteer now!",
  "Make an impact: volunteer and brighten someone's day.",
  "Time for a positive change—volunteer today!",
  "Your community needs you—get volunteering!",
  "Spread joy by volunteering today!",
  "A little help goes a long way; volunteer now!",
  "Volunteer today and inspire tomorrow.",
  "Step up, stand out—volunteer today!",
  "Good day! Make today count by volunteering.",
  "Volunteer and turn compassion into action.",
  "Every act of volunteering creates ripples of change.",
  "Get involved; your hands can build a better community.",
  "Find purpose in giving—volunteer today!",
  "Create a legacy of service—volunteer now!",
  "Sharing is caring. Volunteer and make a difference!",
  "Spark change in your community by volunteering.",
  "Today is the day for volunteering and kindness.",
  "Give a little, help a lot—volunteer today!",
  "Your time can change lives—get out there and volunteer!",
  "Choose to serve; volunteer and spread hope.",
  "A volunteer is a lifeline to those in need.",
  "Transform lives, starting with your own—volunteer!",
  "Be the reason someone smiles today—volunteer.",
  "Empower others by sharing your time—volunteer now!",
  "Make an impact today—your community is waiting.",
  "Volunteer and add your positive energy to the world.",
  "Join the movement—volunteer and inspire change.",
  "Turn compassion into action by volunteering.",
  "Every volunteer adds value to our society.",
  "Step forward and volunteer—make life brighter for others.",
  "Find your purpose: volunteer and change lives.",
  "Elevate your day with a dose of volunteer spirit.",
  "A small gesture can create a big change—volunteer!",
  "Your kindness matters—volunteer today.",
  "Engage, empower, and inspire—volunteer now!",
  "Let your heart lead the way—volunteer and serve.",
  "Embrace the joy of giving—volunteer today!",
  "Fuel your passion for service—volunteer and shine.",
  "Help us build a better tomorrow—volunteer!",
  "Make everyday extraordinary by volunteering.",
  "Connect, care, and contribute—volunteer now!",
  "Small actions create great outcomes—volunteer today.",
  "Lend a hand and brighten lives—volunteer.",
  "Your volunteer spirit is the key to change.",
  "Dive into compassion—volunteer and transform lives.",
  "Serve with pride: volunteer and empower your community."
];

// Helper function to calculate the next trigger date for a given hour.
const getNextTriggerDate = (hour) => {
  const now = new Date();
  let triggerDate = new Date();
  triggerDate.setHours(hour, 0, 0, 0); // set time to given hour
  if (triggerDate <= now) {
    triggerDate.setDate(triggerDate.getDate() + 1); // schedule for tomorrow if time has passed
  }
  return triggerDate;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const App = () => {
  // Check for updates (your app update logic)
  useEffect(() => {
    AppUpdateChecker();
  }, []);

  // State for custom animated splash overlay
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync();
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setShowAnimatedSplash(false);
        });
      }
    }
    prepare();
  }, [fadeAnim]);

  // Schedule notifications using expo-notifications
  useEffect(() => {
    // Request permissions (only for physical devices)
    async function requestPermissions() {
      if (Constants.isDevice) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          alert('Permission for notifications was not granted!');
        }
      } else {
        alert('Must use physical device for Notifications');
      }
    }
    requestPermissions();

    // Define three notification times: 7 AM, 12 PM, and 5 PM.
    const notificationTimes = [7, 12, 17];
    notificationTimes.forEach((hour) => {
      // Pick a random message from our array
      const message = messages[Math.floor(Math.random() * messages.length)];
      // Calculate next trigger date for the given hour.
      const triggerDate = getNextTriggerDate(hour);

      // Schedule notification
      Notifications.scheduleNotificationAsync({
        content: {
          title: "Volunteering Reminder",
          body: message,
          sound: 'default',
        },
        trigger: {
          hour,
          minute: 0,
          repeats: true,
        },
      });
    });
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <DrawerNavigator />
      </NavigationContainer>

      {showAnimatedSplash && (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
          <Image
            source={require('./assets/splashscreen.jpg')}
            style={styles.splashImage}
          />
        </Animated.View>
      )}
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  splashImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

registerRootComponent(App);
export default App;
