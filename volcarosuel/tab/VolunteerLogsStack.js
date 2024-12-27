import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../../auth/AuthContext';
import VolunteerLogs from '../volunteer_log';
import LoginScreen from '../../auth/LoginScreen';
import RegisterScreen from '../../auth/RegisterScreen';

const Stack = createStackNavigator();

const VolunteerLogsStack = () => {
  const { user, initialScreen } = useContext(AuthContext);

  return (
    <Stack.Navigator
      initialRouteName={initialScreen}
      screenOptions={{ headerShown: false }}
    >
      {user ? (
        <Stack.Screen name="VolunteerLogs" component={VolunteerLogs} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default VolunteerLogsStack;
