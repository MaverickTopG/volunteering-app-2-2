// App.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigator from './navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './screens/Login';
import Register from './screens/Register';
import Feed from './screens/Feed';
import { registerRootComponent } from 'expo';
import { AuthProvider } from './screens/AuthContext'; // Import AuthProvider

const Stack = createStackNavigator();

const StackNav = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" component={DrawerNavigator} />
      <Stack.Screen name="login" component={Login} />
      <Stack.Screen name="register" component={Register} />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StackNav />
      </NavigationContainer>
    </AuthProvider>
  );
};

registerRootComponent(App);

export default App;
