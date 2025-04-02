import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as Animatable from "react-native-animatable";
import AntDesign from "@expo/vector-icons/AntDesign";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { AuthContext } from '../../auth/AuthContext';
import AnimalCarousel from '../displayer/showContainer';
import SearchScreen from '../screens/SearchScreen';
import AIScreen from '../screens/ProfileScreen';
import VolunteerLogs from '../screens/volunteer_log';
import LoginScreen from '../../auth/LoginScreen';
import RegisterScreen from '../../auth/RegisterScreen';
import DisplayScreen from '../displayer/ShowScreen';
import MapScreen from '../screens/MapScreen';
import SplashScreen from '../screens/Splashscreen';
import DeleteScreen from '../../auth/deleteScreen';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from "@react-navigation/stack";


const Colors = {
  primary: "#000", // Black
  white: "#fff",
  whiteAlpha: "rgba(255,255,255,0.5)",
};

const { width: screenWidth } = Dimensions.get("window");
const ORIGINAL_WIDTH = screenWidth * 0.8; // Full width of the tab bar
const COLLAPSED_WIDTH = ORIGINAL_WIDTH * 0.3; // 75% of original width
const TAB_BAR_HEIGHT = 60;
const AUTO_COLLAPSE_DELAY = 5000; // 3 seconds delay
const FADE_DURATION = 650; // 500ms for fade between states


const Stack = createStackNavigator();

// Define baseline dimensions
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

/* --------------------------------------
   TabStack (merged carousel functionalities)
-------------------------------------- */
const TabStack = ({ route }) => {
  const { reference } = route?.params || {};
  const stackNavigation = useNavigation();

  // When TabStack gains focus, reset so that SearchScreen is on top
  useFocusEffect(
    useCallback(() => {
      stackNavigation.reset({
        index: 0,
        routes: [{ name: 'SearchScreen' }],
      });
    }, [stackNavigation])
  );

  return (
    <Stack.Navigator
      initialRouteName="SearchScreen"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="SearchScreen"
        component={SearchScreen}
      />
      <Stack.Screen
        name="Carousel"
        component={AnimalCarousel}
        initialParams={{ reference }}
      />
      <Stack.Screen
        name="DisplayScreen"
        component={DisplayScreen}
      />
    </Stack.Navigator>
  );
};

/* --------------------------------------
   VolunteerLogsStack with Auth Integration
-------------------------------------- */
const VolunteerLogsStack = () => {
  const { user } = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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



const TabArr = [
  { route: "Search", label: "Home", icon: "home", component: TabStack },
  { route: "Ordix", label: "Ordix", icon: "search1", component: AIScreen,  },
  { route: "Volunteer", label: "Logs", icon: "team", component: VolunteerLogsStack },
  { route: "Map", label: "Map", icon: "location", component: MapScreen,   isEvilIcon: true, },
  {
    route: "Donate",
    label: "Donate",
    icon: "user",
    component: SplashScreen,
    isEvilIcon: true,
  },
];

// Each tab button in expanded mode
const TabButton = ({ item, onPress, accessibilityState }) => {
  const focused = accessibilityState.selected;
  const bubbleRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    if (focused) {
      bubbleRef.current.animate({ 0: { scale: 0 }, 1: { scale: 1 } }, 300);
      labelRef.current.animate(
        { 0: { scale: 0, opacity: 0 }, 1: { scale: 1, opacity: 1 } },
        300
      );
    } else {
      bubbleRef.current.animate({ 0: { scale: 1 }, 1: { scale: 0 } }, 300);
      labelRef.current.animate(
        { 0: { scale: 1, opacity: 1 }, 1: { scale: 0, opacity: 0 } },
        300
      );
    }
  }, [focused]);

  const renderIcon = () => {
    if (item.isEvilIcon) {
      return (
        <Animatable.View>
          <EvilIcons
            name={item.icon}
            size={28}
            color={focused ? Colors.white : Colors.whiteAlpha}
            style={{ marginRight: focused ? 4 : 0 }}
          />
        </Animatable.View>
      );
    }
    return (
      <Animatable.View>
        <AntDesign
          name={item.icon}
          size={20}
          color={focused ? Colors.white : Colors.whiteAlpha}
          style={{ marginRight: focused ? 4 : 0 }}
        />
      </Animatable.View>
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={[styles.tabItemContainer, { flex: focused ? 1.4 : 1 }]}
    >
      <View>
        <Animatable.View
          ref={bubbleRef}
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: Colors.primary, borderRadius: 16 },
          ]}
        />
        <View style={styles.tabItem}>
          {renderIcon()}
          <Animatable.View ref={labelRef} style={styles.labelWrapper}>
            {focused && <Text style={styles.label}>{item.label}</Text>}
          </Animatable.View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// The custom tab bar with auto-collapse
const CustomTabBar = (props) => {
  const { state, navigation } = props;

  // Track whether the bar is expanded or collapsed
  const [expanded, setExpanded] = useState(true);

  // Timer to handle inactivity
  const autoCollapseTimer = useRef(null);

  // Shared values for container width and icon fade
  const containerWidth = useSharedValue(ORIGINAL_WIDTH);
  const touchIDOpacity = useSharedValue(0);

  // We define all hooks (useAnimatedStyle) unconditionally
  const rContainerStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(containerWidth.value, { duration: FADE_DURATION }),
    };
  });

  const rTouchIDStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(touchIDOpacity.value, { duration: FADE_DURATION }),
    };
  });

  // Reset auto-collapse timer whenever the user interacts
  const resetAutoCollapse = useCallback(() => {
    if (autoCollapseTimer.current) {
      clearTimeout(autoCollapseTimer.current);
    }
    if (expanded) {
      autoCollapseTimer.current = setTimeout(() => {
        // Collapse
        setExpanded(false);
        containerWidth.value = COLLAPSED_WIDTH;
        touchIDOpacity.value = 1; // fade in the Touch ID icon
      }, AUTO_COLLAPSE_DELAY);
    }
  }, [expanded, containerWidth, touchIDOpacity]);

  // Expand the bar if collapsed
  const handlePress = useCallback(() => {
    if (!expanded) {
      // Expand
      setExpanded(true);
      containerWidth.value = ORIGINAL_WIDTH;
      touchIDOpacity.value = 0; // fade out the Touch ID icon
    }
    resetAutoCollapse();
  }, [expanded, containerWidth, touchIDOpacity, resetAutoCollapse]);

  useEffect(() => {
    // Start or reset the auto-collapse countdown
    resetAutoCollapse();
    return () => {
      if (autoCollapseTimer.current) clearTimeout(autoCollapseTimer.current);
    };
  }, [resetAutoCollapse]);

  // If expanded, show the normal tab bar with items
  if (expanded) {
    return (
      <TouchableWithoutFeedback onPress={handlePress}>
        <Animated.View style={[styles.tabBarContainer, rContainerStyle]}>
          {state.routes.map((route, index) => {
            const item = TabArr.find(
              (i) => i.route.toLowerCase() === route.name.toLowerCase()
            );
            if (!item) return null;

            const isFocused = state.index === index;

            const onPressTab = () => {
              if (!isFocused) {
                navigation.navigate(item.route);
              }
              resetAutoCollapse();
            };

            return (
              <TabButton
                key={route.key}
                item={item}
                onPress={onPressTab}
                accessibilityState={{ selected: isFocused }}
              />
            );
          })}
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  } else {
    // Collapsed state: show a single fingerprint icon
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        <Animated.View
          style={[
            styles.tabBarContainer,
            rContainerStyle,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Animated.View style={rTouchIDStyle}>
            <Ionicons name="finger-print" size={28} color={Colors.white} />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    );
  }
};

// Bottom Tab Navigator
const Tab = createBottomTabNavigator();

function PillTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, tabBarStyle: { height: TAB_BAR_HEIGHT } }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {TabArr.map((item) => (
        <Tab.Screen
          key={item.route}
          name={item.route}
          component={item.component}
          options={{ title: item.label }}
        />
      ))}
    </Tab.Navigator>
  );
}

export default PillTabNavigator;

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
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tabItemContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: TAB_BAR_HEIGHT,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 16,
  },
  labelWrapper: {
    marginLeft: 6,
  },
  label: {
    color: Colors.white,
    fontSize: 12,
    paddingHorizontal: 8,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  screenText: {
    fontSize: 24,
    color: Colors.primary,
  },
});
