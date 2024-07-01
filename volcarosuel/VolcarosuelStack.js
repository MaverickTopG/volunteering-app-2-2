// volcarosuel/VolcarosuelStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AnimalCarousel from './Sections/animalCarousel';
import ShowScreen from './ShowScreen';

const Stack = createStackNavigator();

const VolcarosuelStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="AnimalCarousel" component={AnimalCarousel} />
      <Stack.Screen name="DisplayScreen" component={ShowScreen} />
    </Stack.Navigator>
  );
};

export default VolcarosuelStack;
