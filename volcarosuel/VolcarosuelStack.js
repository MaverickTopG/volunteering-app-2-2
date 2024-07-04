// volcarosuel/VolcarosuelStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AnimalCarousel from './Sections/animalCarousel';
import ShowScreen from './ShowScreen';
import SplashScreen from './tab/Splashscreen';

const Stack = createStackNavigator();

const VolcarosuelStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="AnimalCarousel" component={AnimalCarousel} />
      <Stack.Screen name="DisplayScreen" component={ShowScreen} />
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
    </Stack.Navigator>
  );
};


export default VolcarosuelStack;
