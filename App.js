import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, AuthContext } from './auth/AuthContext';  // Adjust the path
import DrawerNavigator from './navigation/drawer';
import LoginScreen from './auth/LoginScreen';  // Adjust path
import RegisterScreen from './auth/RegisterScreen';  // Adjust path
import { CarouselProvider } from './volcarosuel/tab/CarosuelSelection.js';
import { registerRootComponent } from 'expo';

const Stack = createStackNavigator();

// Main Stack Navigator
const StackNav = () => {
  const { user, loading } = useContext(AuthContext);  // Get user and loading status from AuthContext

  if (loading) {
    return null; // You can add a loading indicator here if needed
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // If the user is authenticated, show the DrawerNavigator (the main app)
        <Stack.Screen name="Home" component={DrawerNavigator} />
      ) : (
        // If the user is not authenticated, show the Login/Register screens
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CarouselProvider>
        <NavigationContainer>
          <StackNav />
        </NavigationContainer>
      </CarouselProvider>
    </AuthProvider>
  );
};

registerRootComponent(App);

export default App;
