// DrawerNavigator.js
import React, { useEffect, useState, useContext } from 'react';
import { View, StatusBar, StyleSheet, Dimensions } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimalTabNavigator from '../volcarosuel/Navigators/AnimalTabNavigator';
import CustomSideBarMenu from './CustomSideBarMenu';
import OrganizationScreen from '../volcarosuel/screens/OrganizationScreen';
import AccountScreen from '../volcarosuel/screens/AccountScreen';
import { AuthContext } from '../auth/AuthContext';
import { themePacks, seasonal } from '../volcarosuel/screens/shop';
import { useFocusEffect } from '@react-navigation/native';
const DEFAULT_PALETTE = [
  '#fff6e7',
  '#fff0d4',
  '#ffe8c9',
  '#333333',
];


const { width } = Dimensions.get('window');
const guidelineBaseWidth = 428;
const scale = size => (width / guidelineBaseWidth) * size;

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const { user } = useContext(AuthContext);

  // default palette: [ bg, gradStart, gradEnd, textColor ]
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  const [loading, setLoading] = useState(true);

  const loadActiveTheme = async () => {
    if (!user) {
      setPalette(DEFAULT_PALETTE);
      setLoading(false);
      return;
    }
    try {
      const key = `@shop/active-${user.uid}`;
      const id  = await AsyncStorage.getItem(key);
      if (id) {
        const pack =
          themePacks.find(t => t.id === id) ||
          seasonal.find(s => s.id === id);
        if (pack?.colors) {
          const c = pack.colors;
          // fill out exactly 4 slots
          setPalette([
            c[0] ?? DEFAULT_PALETTE[0],
            c[1] ?? DEFAULT_PALETTE[1],
            c[2] ?? DEFAULT_PALETTE[2],
            c[3] ?? DEFAULT_PALETTE[3],
          ]);
          return;
        }
      }
      // no active theme found
      setPalette(DEFAULT_PALETTE);
    } catch (e) {
      console.warn('Failed loading active theme', e);
      setPalette(DEFAULT_PALETTE);
    } finally {
      setLoading(false);
    }
  };

  // run on mount...
  useEffect(() => { loadActiveTheme(); }, [user]);
  // ...and every time screen regains focus
  useFocusEffect(
    React.useCallback(() => {
      loadActiveTheme();
    }, [user])
  );
  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={palette[0]}
      />
      <Drawer.Navigator
        drawerContent={props => <CustomSideBarMenu {...props} />}
        screenOptions={{
          drawerType: 'front',
          overlayColor: palette[3] + '33',      // semi-transparent overlay
          drawerStyle: {
            backgroundColor: palette[0],
            width: scale(280),
          },
          sceneContainerStyle: {
            backgroundColor: palette[0],
          },
          headerBackground: () => (
            <LinearGradient
              colors={[palette[0], palette[0]]}
              style={StyleSheet.absoluteFill}
            />
          ),
          headerTintColor: palette[3],
          headerTitleStyle: { color: palette[3] },
          headerStyle: { backgroundColor: 'transparent' },
          swipeEnabled: false,
          headerLeft: () => null,
        }}
      >
        <Drawer.Screen
          name="NexoLink"
          component={AnimalTabNavigator}
          options={{ drawerLabel: 'Home', headerTitle: 'NexoLink' }}
        />

        <Drawer.Screen
          name="Organizations"
          component={OrganizationScreen}
          options={{ drawerLabel: 'Add an Org' }}
        />

        <Drawer.Screen
          name="Account"
          component={AccountScreen}
          options={{ drawerLabel: 'Account' }}
        />
      </Drawer.Navigator>
    </View>
  );
}
