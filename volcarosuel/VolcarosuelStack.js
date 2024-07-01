// volcarosuel/VolcarosuelStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AnimalCarousel from './Sections/animalCarousel';
import TechCarousel from './Sections/techCarosuel';
import ChildrenCarousel from './Sections/childrenCarosuel';
import SeniorsCarousel from './Sections/seniorsCarousel';
import HospitalCarousel from './Sections/hospitalCarousel';
import DisplayScreen from './DisplayScreen';

const Stack = createStackNavigator();

const VolcarosuelStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="AnimalCarousel" component={AnimalCarousel} />
      <Stack.Screen name="TechCarousel" component={TechCarousel} />
      <Stack.Screen name="ChildrenCarousel" component={ChildrenCarousel} />
      <Stack.Screen name="SeniorsCarousel" component={SeniorsCarousel} />
      <Stack.Screen name="HospitalCarousel" component={HospitalCarousel} />
      <Stack.Screen name="DisplayScreen" component={DisplayScreen} />
    </Stack.Navigator>
  );
};

export default VolcarosuelStack;
