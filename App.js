import React, { useState, useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './auth/AuthContext';  // Adjust the path
import DrawerNavigator from './navigation/drawer';
import LoginScreen from './auth/LoginScreen';  // Adjust path
import RegisterScreen from './auth/RegisterScreen';
import { registerRootComponent } from 'expo';
import AnimalTabNavigator from './volcarosuel/Navigators/AnimalTabNavigator.js';
import AppUpdateChecker from './AppUpdateChecker.js';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

// Main Stack Navigator
const StackNav = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={DrawerNavigator} />
      <Stack.Screen name="AnimalTabNavigator" component={AnimalTabNavigator} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const App = () => {
  // Check for app updates on app load
  useEffect(() => {
    AppUpdateChecker();
  }, []);

  // State to control the custom animated splash overlay
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    async function prepare() {
      try {
        // Wait for 2 seconds while native splash is displayed
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (e) {
        console.warn(e);
      } finally {
        // Hide the native splash screen once our delay is over
        await SplashScreen.hideAsync();
        // Start fade-out animation for our custom overlay over 0.5 seconds
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          // Once fade-out completes, remove the custom overlay
          setShowAnimatedSplash(false);
        });
      }
    }
    prepare();
  }, [fadeAnim]);

  return (
    <AuthProvider>
      <NavigationContainer>
        <DrawerNavigator />
      </NavigationContainer>
      {showAnimatedSplash && (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
          <Image
            source={require('./assets/splashscreen.jpg')} // Ensure this path is correct
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
