import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  
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
import DisplayScreen from "../displayer/ShowScreen";
import MapScreen from "../screens/MapScreen";
import SplashScreen from "../screens/Splashscreen";
import DeleteScreen from "../../auth/deleteScreen";

// Imported extension screens
import SuggestOrganizationScreen from "../screens/OrganizationScreen";
import AccountStackNavigator from "../screens/AccountScreen";


// ---------- Constants & Dimensions ----------
const Colors = {
  primary: "#000", // Black
  white: "#fff",
  whiteAlpha: "rgba(255,255,255,0.5)",
};

const { width: screenWidth } = Dimensions.get("window");
const ORIGINAL_WIDTH = screenWidth * 0.8; // Full width of the tab bar
const COLLAPSED_WIDTH = ORIGINAL_WIDTH * 0.3; // Collapsed width
const TAB_BAR_HEIGHT = 60;
const AUTO_COLLAPSE_DELAY = 5000; // 20 seconds inactivity delay
const FADE_DURATION = 650; // 650ms for fade

const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get("window");
const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

// ---------- Navigation Stacks ----------
const Stack = createStackNavigator();

const TabStack = ({ route }) => {
  const { reference } = route?.params || {};
  const stackNavigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      stackNavigation.reset({
        index: 0,
        routes: [{ name: "SearchScreen" }],
      });
    }, [stackNavigation])
  );

  return (
    <Stack.Navigator initialRouteName="SearchScreen" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen name="Carousel" component={AnimalCarousel} initialParams={{ reference }} />
      <Stack.Screen name="DisplayScreen" component={DisplayScreen} />
    </Stack.Navigator>
  );
};

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

// ---------- Tab Routes Array ----------
const TabArr = [
  { route: "Search", label: "Home", icon: "home", component: TabStack },
  { route: "Ordix", label: "Ordix", icon: "search1", component: AIScreen },
  { route: "Volunteer", label: "Logs", icon: "team", component: VolunteerLogsStack },
  { route: "Map", label: "Map", icon: "location", component: MapScreen, isEvilIcon: true },
  { route: "Donate", label: "Donate", icon: "user", component: SplashScreen, isEvilIcon: true },
];

// ---------- Custom Tab Button ----------
const TabButton = ({ item, onPress, accessibilityState }) => {
  const focused = accessibilityState.selected;
  const bubbleRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    if (focused) {
      bubbleRef.current?.animate({ 0: { scale: 0 }, 1: { scale: 1 } }, 300);
      labelRef.current?.animate({ 0: { scale: 0, opacity: 0 }, 1: { scale: 1, opacity: 1 } }, 300);
    } else {
      bubbleRef.current?.animate({ 0: { scale: 1 }, 1: { scale: 0 } }, 300);
      labelRef.current?.animate({ 0: { scale: 1, opacity: 1 }, 1: { scale: 0, opacity: 0 } }, 300);
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
    <TouchableOpacity onPress={onPress} activeOpacity={1} style={[styles.tabItemContainer, { flex: focused ? 1.4 : 1 }]}>
      <View>
        <Animatable.View
          ref={bubbleRef}
          style={[StyleSheet.absoluteFill, { backgroundColor: Colors.primary, borderRadius: 16 }]}
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

// ---------- Extension Buttons Component ----------
const ExtensionButtons = ({ leftStyle, topStyle, rightStyle, onSelectExtension }) => {
  return (
    <>
      <Animated.View style={[extBarStylesExtension.button, leftStyle]}>
        <TouchableOpacity onPress={() => onSelectExtension("Suggestions")}>
          <Ionicons name="bulb-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    
      <Animated.View style={[extBarStylesExtension.button, rightStyle]}>
        <TouchableOpacity onPress={() => onSelectExtension("Account")}>
          <Ionicons name="person-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

// ---------- Extension Bar (Reanimated 2) ----------
const ExtensionBar = ({ onSelectExtension }) => {
  const open = useSharedValue(0); // 0 collapsed, 1 expanded

  const toggleExtension = () => {
    open.value = withTiming(open.value === 1 ? 0 : 1, { duration: 300 });
  };

  const distance = 60; // How far the extension buttons should move
  const leftStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(open.value, [0, 1], [0, -distance]) }],
    opacity: open.value,
  }));
  const topStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(open.value, [0, 1], [0, -distance]) }],
    opacity: open.value,
  }));
  const rightStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(open.value, [0, 1], [0, distance]) }],
    opacity: open.value,
  }));

  return (
    <View style={extBarStylesExtension.container}>
      <ExtensionButtons
        leftStyle={leftStyle}
        topStyle={topStyle}
        rightStyle={rightStyle}
        onSelectExtension={onSelectExtension}
      />
      <TouchableOpacity onPress={toggleExtension} style={extBarStylesExtension.mainButton}>
        <Ionicons name={open.value > 0.5 ? "close" : "add"} size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const extBarStylesExtension = StyleSheet.create({
  container: {
    position: "absolute",
    top: 25, // Adjust to position the extension bar above the pill
    left: 45,
    transform: [{ translateX: -25 }], // Center horizontally (half of main button width)
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

// ---------- Custom Tab Bar ----------
const CustomTabBar = (props) => {
  const { state, navigation } = props;
  const [expanded, setExpanded] = useState(true);
  const autoCollapseTimer = useRef(null);
  const containerWidth = useSharedValue(ORIGINAL_WIDTH);
  const touchIDOpacity = useSharedValue(0);

  const resetAutoCollapse = useCallback(() => {
    if (autoCollapseTimer.current) clearTimeout(autoCollapseTimer.current);
    if (expanded) {
      autoCollapseTimer.current = setTimeout(() => {
        setExpanded(false);
        containerWidth.value = COLLAPSED_WIDTH;
        touchIDOpacity.value = 1;
      }, AUTO_COLLAPSE_DELAY);
    }
  }, [expanded, containerWidth, touchIDOpacity]);

  const handlePress = useCallback(() => {
    if (!expanded) {
      setExpanded(true);
      containerWidth.value = ORIGINAL_WIDTH;
      touchIDOpacity.value = 0;
    }
    resetAutoCollapse();
  }, [expanded, containerWidth, touchIDOpacity, resetAutoCollapse]);

  useEffect(() => {
    resetAutoCollapse();
    return () => {
      if (autoCollapseTimer.current) clearTimeout(autoCollapseTimer.current);
    };
  }, [resetAutoCollapse]);

  const rContainerStyle = useAnimatedStyle(() => ({
    width: withTiming(containerWidth.value, { duration: FADE_DURATION }),
  }));
  const rTouchIDStyle = useAnimatedStyle(() => ({
    opacity: withTiming(touchIDOpacity.value, { duration: FADE_DURATION }),
  }));

  // Callback for extension selection
  const handleSelectExtension = (extName) => {
    navigation.navigate(extName);
  };

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
              if (!isFocused) navigation.navigate(item.route);
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
          {/* Integrated Extension Bar */}
          <View style={extensionStyles.centerWrapper}>
            <ExtensionBar onSelectExtension={handleSelectExtension} />
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  } else {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        <Animated.View style={[styles.tabBarContainer, rContainerStyle, { justifyContent: "center", alignItems: "center" }]}>
          <Animated.View style={rTouchIDStyle}>
            <Ionicons name="finger-print" size={28} color={Colors.white} />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    );
  }
};

const extensionStyles = StyleSheet.create({
  centerWrapper: {
    position: "absolute",
    top: -80, // Adjust to position the extension bar above the pill
    left: "50%",
    transform: [{ translateX: -25 }], // Half of main extension button width (50/2)
  },
});

// ---------- Bottom Tab Navigator ----------
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
            options={{ title: item.label }}
          />
        ))}
        {/* Extension routes */}
        <TabNav.Screen name="Suggestions" component={SuggestOrganizationScreen} options={{ headerShown: false }} />
        <TabNav.Screen name="Account" component={AccountStackNavigator} options={{ headerShown: false }} />
      </TabNav.Navigator>
  
  );
}

export default PillTabNavigator;

// ---------- Main Styles ----------
const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 25, // Set to 0 to remove extra white space at the bottom
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
});

const placeholderStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    color: Colors.primary,
  },
});
