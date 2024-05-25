// App.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DrawerNavigator from './navigation/drawer';
import Login from './screens/Login.js'; 
import Register from './screens/Register.js';
import Feed from './screens/Feed.js';
import Logout from './screens/logout.js'; // Ensure proper case for filenames
import { AuthProvider } from './screens/AuthContext.js';
import { registerRootComponent } from 'expo';

const Stack = createStackNavigator();

const StackNav = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DrawerNavigator} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Logout" component={Logout} />
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
