// SixTabNavigator.tsx

import React, { useContext, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { AuthContext } from "../../auth/AuthContext"; // adjust path if needed

import SearchScreen from "../screens/SearchScreen";
import AnimalCarousel from "../displayer/showContainer";
import DisplayScreen from "../displayer/ShowScreen";

import VolunteerLogs from "../screens/volunteer_log";
import LoginScreen from "../../auth/LoginScreen";
import RegisterScreen from "../../auth/RegisterScreen";
import DeleteScreen from "../../auth/deleteScreen";
import MapScreen from "../screens/MapScreen";
import ProfileScreen from "../screens/ProfileScreen";
import NexolinkLoginScreen from "../../auth/selectscreen";
import AccountStackNavigator from "../screens/AccountScreen";
import StatsScreen from "../screens/AccountScreen";
import BadgesScreen from "../screens/badges";
import AboutScreen from "../screens/about";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── DIMENSIONS & COLORS ───
const PILL_HEIGHT = 90;
const CIRCLE_DIAMETER = 50 * 1.15; // ~52.5px
const ICON_SIZE_ACTIVE = 24 * 1.25;   // 30px
const ICON_SIZE_INACTIVE = 20 * 1.25; // 25px

const TAB_COUNT = 4;
const PILL_WIDTH = SCREEN_WIDTH * 0.8;
const SLOT_WIDTH = PILL_WIDTH / TAB_COUNT;

const COLORS = {
  pillBackground: "#111111",
  circleBackground: "#FFFFFF",
  activeIconColor: "#000000",
  inactiveIconColor: "rgba(255,255,255,0.6)",
  shadow: "#000000",
};

// ─── NESTED STACKS ───────────────────────────────────────────────────
const Stack = createStackNavigator();

/**
 * HomeStack is now named “Search” at the bottom‐tab level.
 * It always starts at “SearchScreen” when the “Search” tab is focused.
 * If you want to jump to Carousel or Display, call:
 *   navigation.navigate("Search", { screen: "Carousel", params: { ... } });
 */
const HomeStack = ({ route }: any) => {
  const navigation = useNavigation();

  // Whenever the “Search” tab regains focus, force it back to SearchScreen:
  useFocusEffect(
    React.useCallback(() => {
      navigation.reset({ index: 0, routes: [{ name: "SearchScreen" }] });
    }, [navigation])
  );

  return (
    <Stack.Navigator
      initialRouteName="SearchScreen"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen
        name="Carousel"
        component={AnimalCarousel}
        initialParams={{ reference: route?.params?.reference }}
      />
      <Stack.Screen name="DisplayScreen" component={DisplayScreen} />
     
    </Stack.Navigator>
  );
};

/**
 * VolunteerLogsStack: if user is logged in, show logs; otherwise show Login/Register/Delete
 */
const VolunteerLogsStack = () => {
  const { user } = useContext(AuthContext);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <><Stack.Screen name="VolunteerLogs" component={VolunteerLogs} /><Stack.Screen name="Delete" component={DeleteScreen} /></>

      ) : (
        <>
          <Stack.Screen name="Inital" component={NexolinkLoginScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

/**
 * Map is just a single screen (no nested stack needed).
 */

/**
 * AccountStack: if user is logged in, show Profile; otherwise show Login/Register/Delete
 */

const AccountStack = ({ route }: any) => {
  const navigation = useNavigation();

  // Whenever the “Search” tab regains focus, force it back to SearchScreen:
  useFocusEffect(
    React.useCallback(() => {
      navigation.reset({ index: 0, routes: [{ name: "Badges" }] });
    }, [navigation])
  );

  return (
    <Stack.Navigator
      initialRouteName="Badges"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Badges" component={BadgesScreen} />
      <Stack.Screen name="Stats" component={AccountStackNavigator} />
      <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{ headerShown: false }}
        />
    </Stack.Navigator>
  );
};
// ─── BOTTOM‐TAB CONFIGURATION ────────────────────────────────────────
// We give each tab a “route” name that must exactly match what you call in navigation.navigate().
// The very first tab is now named "Search" so that navigating to "Search" will work.
const TabArr = [
  { route: "Search",    icon: "home",       component: HomeStack },
  { route: "Volunteer", icon: "team",       component: VolunteerLogsStack },
  { route: "Map",       icon: "enviromento", component: MapScreen },
  { route: "Account",   icon: "user",       component: AccountStack },
];

// Helper: find index of a route name in the tab state
function findRouteIndex(state: any, routeName: string) {
  return state.routes.findIndex((r: any) => r.name === routeName);
}

// ─── CUSTOM TAB BAR ─────────────────────────────────────────────────
const TabNav = createBottomTabNavigator();

const CustomTabBar = ({ state, navigation }: any) => {
  // Shared value for the circle’s horizontal translation
  const circleX = useSharedValue(0);

  // Whenever active index changes, animate circle under that slot
  useEffect(() => {
    const idx = state.index;
    const targetX = idx * SLOT_WIDTH + (SLOT_WIDTH - CIRCLE_DIAMETER) / 2;
    circleX.value = withSpring(targetX, {
      stiffness: 150,
      damping: 12,
      mass: 1,
    });
  }, [state.index, circleX]);

  // Animated style for the white circle
  const rCircleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: circleX.value }],
  }));

  return (
    <View style={styles.pillContainer}>
      {/* White circle that moves under the active tab */}
      <Animated.View style={[styles.circle, rCircleStyle]} />

      {/* Render four tabs side by side */}
      <View style={styles.row}>
        {TabArr.map((item, idx) => {
          const isFocused = state.index === idx;
          return (
            <TouchableOpacity
              key={item.route}
              onPress={() => {
                // If not already on that tab, navigate there:
                if (!isFocused) navigation.navigate(item.route);
              }}
              style={styles.slot}
              activeOpacity={1}
            >
              <AntDesign
                name={item.icon as any}
                size={isFocused ? ICON_SIZE_ACTIVE : ICON_SIZE_INACTIVE}
                color={
                  isFocused
                    ? COLORS.activeIconColor
                    : COLORS.inactiveIconColor
                }
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ─── MAIN TAB NAVIGATOR ──────────────────────────────────────────────
export default function SixTabNavigator() {
  return (
    <TabNav.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {TabArr.map((item) => (
        <TabNav.Screen
          key={item.route}
          name={item.route}
          component={item.component}
        />
      ))}
    </TabNav.Navigator>
  );
}

// ─── STYLES ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  pillContainer: {
    position: "absolute",
    bottom: 20,
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    backgroundColor: COLORS.pillBackground,
    borderRadius: PILL_HEIGHT / 2,
    alignSelf: "center",
    overflow: "hidden",
    // iOS shadow
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    // Android elevation
    elevation: 5,
  },
  circle: {
    position: "absolute",
    width: CIRCLE_DIAMETER,
    height: CIRCLE_DIAMETER,
    borderRadius: CIRCLE_DIAMETER / 2,
    backgroundColor: COLORS.circleBackground,
    top: (PILL_HEIGHT - CIRCLE_DIAMETER) / 2,
    left: 0, // Reanimated will drive this X position
  },
  row: {
    flexDirection: "row",
    width: "100%",
    height: "100%",
  },
  slot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
