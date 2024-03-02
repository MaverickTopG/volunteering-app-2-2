import React from 'react';
import StackNavigator from './stack'
import Profile from '../screens/profile';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Logout from '../screens/logout'
import CustomSideBarMenu from '../screens/CustomSideBarMenu';
const Drawer = createDrawerNavigator();
import TStackNavigator from '../A&WNav/stack'
import VStackNavigator from '../C&FNav/stack.js'

const DrawerNavigator = ()=> {
  return(
 <Drawer.Navigator 
 drawerContent = {props=> 
 <CustomSideBarMenu {...props}/>
 }
 screenOptions = {{headerShown : true}}>
 <Drawer.Screen name = "Animal & Wildlife" component = {TStackNavigator}/>
 <Drawer.Screen name = "Children and Family" component = {VStackNavigator}/>
 <Drawer.Screen name = "Working with Seniors" component = {StackNavigator}/>
 <Drawer.Screen name = "Profile" component = {Profile}/>
 <Drawer.Screen name = "Logout" component = {Logout}/>
</Drawer.Navigator>
  )
}
export default DrawerNavigator;