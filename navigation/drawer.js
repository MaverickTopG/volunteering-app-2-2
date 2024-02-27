import React from 'react';
import StackNavigator from './stack'
import Profile from '../screens/profile';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Logout from '../screens/logout'
import CustomSideBarMenu from '../screens/CustomSideBarMenu';
const Drawer = createDrawerNavigator();
import TStackNavigator from '../TechNav/stack'

const DrawerNavigator = ()=> {
  return(
 <Drawer.Navigator 
 drawerContent = {props=> 
 <CustomSideBarMenu {...props}/>
 }
 screenOptions = {{headerShown : true}}>
 <Drawer.Screen name = "home" component = {StackNavigator}/>
 <Drawer.Screen name = "Profile" component = {Profile}/>
 <Drawer.Screen name = "Logout" component = {Logout}/>
 <Drawer.Screen name = "Technology" component = {TStackNavigator}/>
</Drawer.Navigator>
  )
}
export default DrawerNavigator;