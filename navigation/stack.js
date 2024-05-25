import React from 'react';
import BottomTab from './tab';
import StoryScreen from '../screens/StoryScreen'
import {createStackNavigator} from '@react-navigation/stack';

const Stack = createStackNavigator();

const StackNavigator = ()=> {
  return(
 <Stack.Navigator screenOptions = {{headerShown : false}}>
 <Stack.Screen name = "W & S" component = {BottomTab}/>
 <Stack.Screen name = "StoryScreen" component = {StoryScreen}/>
</Stack.Navigator>
  )
}
export default StackNavigator;