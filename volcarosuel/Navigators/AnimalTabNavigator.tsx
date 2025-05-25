import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import * as Animatable from "react-native-animatable";
import AntDesign from "@expo/vector-icons/AntDesign";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { AuthContext } from "../../auth/AuthContext";
import AnimalCarousel from "../displayer/showContainer";
import SearchScreen from "../screens/SearchScreen";
import AIScreen from "../screens/ProfileScreen";
import VolunteerLogs from "../screens/volunteer_log";
import LoginScreen from "../../auth/LoginScreen";
import RegisterScreen from "../../auth/RegisterScreen";
import DeleteScreen from "../../auth/deleteScreen";
import DisplayScreen from "../displayer/ShowScreen";
import MapScreen from "../screens/MapScreen";
import SplashScreen from "../screens/Splashscreen";
import LiveOps from "../screens/LiveOp";
import ShopScreen from "../screens/shop";

import SuggestOrganizationScreen from "../screens/OrganizationScreen";
import AccountStackNavigator from "../screens/AccountScreen";
import LeaderboardScreen from "../screens/LeaderBoardScreen";

const spaceshipImage = require("../../assets/spaceship.png");

// ---------- constants ----------
const Colors = {
  primary: "#000",
  white: "#fff6e7",
  whiteAlpha: "rgba(255,255,255,0.5)",
};
const { width: screenWidth } = Dimensions.get("window");
const ORIGINAL_WIDTH = screenWidth * 0.8;
const COLLAPSED_WIDTH = ORIGINAL_WIDTH * 0.3;
const TAB_BAR_HEIGHT = 60;
const AUTO_COLLAPSE_DELAY = 5000;
const FADE_DURATION = 650;

// ---------- navigation stacks ----------
const Stack = createStackNavigator();

const TabStack = ({ route }) => {
  const { reference } = route?.params || {};
  const stackNav = useNavigation();
  useFocusEffect(
    useCallback(() => {
      stackNav.reset({ index: 0, routes: [{ name: "SearchScreen" }] });
    }, [stackNav])
  );

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen
        name="Carousel"
        component={AnimalCarousel}
        initialParams={{ reference }}
      />
      <Stack.Screen name="DisplayScreen" component={DisplayScreen} />
      <Stack.Screen name="LiveOps" component={LiveOps} />
    </Stack.Navigator>
  );
};

const VolunteerLogsStack = () => {
  const { user } = useContext(AuthContext);
  return (
    
    <Stack.Navigator 
    screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="VolunteerLogs" component={VolunteerLogs} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Delete" component={DeleteScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

// ---------- main pill tabs ----------
const TabArr = [
  { route: "Search", label: "Home", icon: "home", component: TabStack },
  { route: "Ordix", label: "Ordix", icon: "search1", component: AIScreen },
  { route: "Volunteer", label: "Logs", icon: "team", component: VolunteerLogsStack },
  { route: "Map", label: "Map", icon: "location", component: MapScreen, isEvilIcon: true },
  { route: "Donate", label: "Donate", icon: "user", component: SplashScreen, isEvilIcon: true },
];

// ---------- tab button ----------

const TabButton = ({ item, onPress, accessibilityState }) => {
  const focused = accessibilityState.selected;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={[
        styles.tabItemContainer,
        { flex: focused ? 1.4 : 1 }
      ]}
    >
      <View>
        <Animatable.View
          animation={focused ? { 0: { scale: 0 }, 1: { scale: 1 } } : { 0: { scale: 1 }, 1: { scale: 0 } }}
          duration={300}
          style={[StyleSheet.absoluteFill, {
            backgroundColor: Colors.primary,
            borderRadius: 16,
          }]}
        />
        <View style={styles.tabItem}>
          {item.isEvilIcon
            ? <EvilIcons
                name={item.icon}
                size={28}
                color={focused ? Colors.white : Colors.whiteAlpha}
              />
            : <AntDesign
                name={item.icon}
                size={20}
                color={focused ? Colors.white : Colors.whiteAlpha}
              />
          }
        </View>
      </View>
    </TouchableOpacity>
      );
    };
// ---------- extension FAB ----------
const RADIUS = 60;
const EXT_ITEMS = [
  { angle: 120, icon: 'person-outline', route: 'Account' },
  { angle: 180, icon: 'bulb-outline',  route: 'Suggestions' },
  { angle:  60, icon: 'trophy-outline', route: 'Leaderboard' },
  { angle:   0, icon: 'cart-outline',   route: 'S' },
];

const ExtensionBar = ({ onSelectExtension, resetAutoCollapse }) => {
  const [isOpen, setIsOpen] = useState(false);
  const open = useSharedValue(0);

  const toggle = useCallback(() => {
    const next = !isOpen;
    setIsOpen(next);
    open.value = withTiming(next ? 1 : 0, { duration: 300 });
    resetAutoCollapse();
  }, [isOpen, open, resetAutoCollapse]);

  return (
    <View style={extStyles.container}>
      {EXT_ITEMS.map(({ angle, icon, route }, i) => {
        const rad = (angle * Math.PI) / 180;
        const x   = RADIUS * Math.cos(rad);
        const y   = -RADIUS * Math.sin(rad);

        const style = useAnimatedStyle(() => ({
          transform: [
            { translateX: interpolate(open.value, [0,1], [0, x]) },
            { translateY: interpolate(open.value, [0,1], [0, y]) },
          ],
          opacity: open.value,
        }));

        const onPress = () => {
          onSelectExtension(route);
          resetAutoCollapse();
        };

        return (
          <Animated.View key={i} style={[extStyles.button, style]}>
            <TouchableOpacity onPress={onPress}>
              <Ionicons name={icon} size={22} color="#fff6e7" />
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      <TouchableOpacity onPress={toggle} style={extStyles.mainButton}>
        <Ionicons name={isOpen ? 'close' : 'add'} size={24} color="#fff6e7" />
      </TouchableOpacity>
    </View>
  );
};

// ---------- custom tab bar ----------
const TabNav = createBottomTabNavigator();

function PillTabNavigator() {
  return (
    <TabNav.Navigator
      screenOptions={{ headerShown: false, tabBarStyle: { height: TAB_BAR_HEIGHT } }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {TabArr.map((item) => (
        <TabNav.Screen
          key={item.route}
          name={item.route}
          component={item.component}
        />
      ))}
      {/* hidden routes */}
      <TabNav.Screen name="Suggestions" component={SuggestOrganizationScreen} />
      <TabNav.Screen name="Account" component={AccountStackNavigator} />
      <TabNav.Screen name="Leaderboard" component={LeaderboardScreen} />
      <TabNav.Screen name="S" component={ShopScreen} />
    </TabNav.Navigator>
  );
}

const CustomTabBar = ({ state, navigation }) => {
  const [expanded, setExpanded] = useState(true);
  const timer = useRef(null);
  const widthAnim = useSharedValue(ORIGINAL_WIDTH);
  const touchOpacity = useSharedValue(0);

  const resetAutoCollapse = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (expanded) {
      timer.current = setTimeout(() => {
        setExpanded(false);
        widthAnim.value = COLLAPSED_WIDTH;
        touchOpacity.value = 1;
      }, AUTO_COLLAPSE_DELAY);
    }
  }, [expanded, widthAnim, touchOpacity]);

  const handlePress = useCallback(() => {
    if (!expanded) {
      setExpanded(true);
      widthAnim.value = ORIGINAL_WIDTH;
      touchOpacity.value = 0;
    }
    resetAutoCollapse();
  }, [expanded, widthAnim, touchOpacity, resetAutoCollapse]);

  useEffect(() => {
    resetAutoCollapse();
    return () => timer.current && clearTimeout(timer.current);
  }, [resetAutoCollapse]);

  const rContainer = useAnimatedStyle(() => ({
    width: withTiming(widthAnim.value, { duration: FADE_DURATION }),
  }));
  const rTouchID = useAnimatedStyle(() => ({
    opacity: withTiming(touchOpacity.value, { duration: FADE_DURATION }),
  }));

  const onSelectExtension = (name) => navigation.navigate(name);

  if (expanded) {
    return (
      <TouchableWithoutFeedback onPress={handlePress}>
        <Animated.View style={[styles.tabBarContainer, rContainer]}>
          {state.routes.map((route, idx) => {
            const item = TabArr.find(i => i.route === route.name);
            if (!item) return null;
            const focused = state.index === idx;
            const onPressTab = () => {
              if (!focused) navigation.navigate(item.route);
              resetAutoCollapse();
            };
            return (
              <TabButton
                key={route.key}
                item={item}
                onPress={onPressTab}
                accessibilityState={{ selected: focused }}
              />
            );
          })}
          <View style={fabStyles.centerWrapper}>
            <ExtensionBar onSelectExtension={onSelectExtension} resetAutoCollapse={resetAutoCollapse} />
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1}>
      <Animated.View style={[styles.tabBarContainer, rContainer, { justifyContent: "center", alignItems: "center" }]}>
        <Animated.View style={rTouchID}>
          <Image source={spaceshipImage} style={{ width: 28, height: 28, resizeMode: "contain", tintColor: "#fff6e7" }} />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default PillTabNavigator;

// ---------- styles ----------
const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 25,
    backgroundColor: Colors.primary,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  tabItemContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: TAB_BAR_HEIGHT,
  },
  tabItem: { flexDirection: "row", alignItems: "center", padding: 8 },
  labelWrapper: { marginLeft: 6 },
  label: { color: Colors.white, fontSize: 12, paddingHorizontal: 8 },
});

const extStyles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 25,
    left: 45,
    transform: [{ translateX: -25 }],
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  mainButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
});

const fabStyles = StyleSheet.create({
  centerWrapper: {
    position: "absolute",
    top: -80,
    left: "50%",
    transform: [{ translateX: -25 }],
  },
});
