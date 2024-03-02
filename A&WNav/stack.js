import React from 'react';
import BottomTab from './tab';
import TScreen from '../A&W/TScreen.js'
import {createStackNavigator} from '@react-navigation/stack';

const Stack = createStackNavigator();

const StackNavigator = ()=> {
  return(
 <Stack.Navigator screenOptions = {{headerShown : false}}>
 <Stack.Screen name = "Animal & Wildlife" component = {BottomTab}/>
 <Stack.Screen name = "TScreen" component = {TScreen}/>
</Stack.Navigator>
  )
}
export default StackNavigator;