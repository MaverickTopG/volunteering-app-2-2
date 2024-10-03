// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// Import the AuthProvider
import { AuthProvider } from './auth/AuthContext.js'; // Adjust the path
import DrawerNavigator from './navigation/drawer';
import { CarouselProvider } from './volcarosuel/tab/CarosuelSelection.js';
import { registerRootComponent } from 'expo';

const Stack = createStackNavigator();

const StackNav = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" component={DrawerNavigator} />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    // Wrap your app with AuthProvider
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
