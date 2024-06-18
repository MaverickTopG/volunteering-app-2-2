import React from 'react';
import BottomTab from './tab.js';
import VScreen from '../C&F/VScreen.js'
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="C & F" component={BottomTab} />
      <Stack.Screen name="VScreen" component={VScreen} />
    </Stack.Navigator>
  )
}
export default StackNavigator;