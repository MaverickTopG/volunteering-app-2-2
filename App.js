import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './auth/AuthContext';  // Adjust the path
import DrawerNavigator from './navigation/drawer';
import LoginScreen from './auth/LoginScreen';  // Adjust path
import RegisterScreen from './auth/RegisterScreen';
import { registerRootComponent } from 'expo';
import AnimalTabNavigator from './volcarosuel/Navigators/AnimalTabNavigator.js';
import AppUpdateChecker from './AppUpdateChecker.js';

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

  return (
    <AuthProvider>
      <NavigationContainer>
        <DrawerNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

registerRootComponent(App);

export default App;
