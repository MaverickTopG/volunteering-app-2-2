// DrawerNavigator.js
import React from 'react';
import { View, StatusBar, StyleSheet, Dimensions } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AnimalTabNavigator from '../volcarosuel/Navigators/AnimalTabNavigator';
import OrganizationScreen from '../volcarosuel/screens/OrganizationScreen';
import AccountScreen from '../volcarosuel/screens/AccountScreen';

const { width } = Dimensions.get('window');
const guidelineBaseWidth = 428;
const scale = size => (width / guidelineBaseWidth) * size;

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <Drawer.Navigator
        // no drawer content at all
        drawerContent={() => null}
        // disable gestures and overlay
        screenOptions={{
          headerShown: false,               // hide header
          swipeEnabled: false,              // disable swipe
          drawerStyle: { width: 0 },        // no drawer width
          overlayColor: 'transparent',      // no scrim
          sceneContainerStyle: {
            backgroundColor: 'transparent', // let your screens paint their own bg
          },
        }}
      >
        <Drawer.Screen
          name="Home"
          component={AnimalTabNavigator}
        />

        <Drawer.Screen
          name="AddOrg"
          component={OrganizationScreen}
        />

        <Drawer.Screen
          name="Account"
          component={AccountScreen}
        />
      </Drawer.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
