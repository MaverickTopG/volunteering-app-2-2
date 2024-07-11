import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AnimalCarousel from './Sections/animalCarousel';
import ShowScreen from './ShowScreen';
import MapScreen from './tab/MapScreen'; // Ensure this is the correct path to MapScreen

const Stack = createStackNavigator();

const VolcarosuelStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="AnimalCarousel" component={AnimalCarousel} />
      <Stack.Screen name="ShowScreen" component={ShowScreen} />
      <Stack.Screen name="MapScreen" component={MapScreen} />
    </Stack.Navigator>
  );
};

export default VolcarosuelStack;
