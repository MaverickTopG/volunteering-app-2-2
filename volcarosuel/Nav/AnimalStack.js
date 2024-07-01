// navigation/AnimalStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AnimalCarousel from '../Sections/animalCarousel';
import DisplayScreen from '../ShowScreen';

const Stack = createStackNavigator();

const AnimalStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AnimalCarousel" component={AnimalCarousel} />
      <Stack.Screen name="DisplayScreen" component={DisplayScreen} />
    </Stack.Navigator>
  );
};

export default AnimalStack;
