//THIS IS FOR ENVIROMENT
import React from 'react';
import BottomTab from './tab';
import LScreen from '../Library/LScreen.js'
import {createStackNavigator} from '@react-navigation/stack';

const Stack = createStackNavigator();

const StackNavigator = ()=> {
  return(
 <Stack.Navigator screenOptions = {{headerShown : false}}>
 <Stack.Screen name = "Library Services" component = {BottomTab}/>
 <Stack.Screen name = "LScreen" component = {LScreen}/>
</Stack.Navigator>
  )
}
export default StackNavigator;