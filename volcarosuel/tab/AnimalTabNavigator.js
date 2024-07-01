import React from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { CurvedBottomBarExpo } from "react-native-curved-bottom-bar";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import AnimalCarousel from "../Sections/animalCarousel";
import SearchScreen from "./SearchScreen";
import MapScreen from "./MapScreen";
import ProfileScreen from "./ProfileScreen";
import { createStackNavigator } from '@react-navigation/stack';
import DisplayScreen from "../ShowScreen";

const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="AnimalCarousel"
        component={AnimalCarousel}
      />
      <Stack.Screen
        name="DisplayScreen"
        component={DisplayScreen}
      />
    </Stack.Navigator>
  );
};

const AnimalTabNavigator = () => {
  const navigation = useNavigation();
  const _renderIcon = (routeName, selectedTab) => {
    let icon = "";

    switch (routeName) {
      case "Home":
        icon = "home";
        break;
      case "Search":
        icon = "search";
        break;
      case "Map":
        icon = "map";
        break;
      case "Profile":
        icon = "person";
        break;
    }

    return (
      <Ionicons
        name={icon}
        size={25}
        color={routeName === selectedTab ? "#fff" : "#ffffff40"}
      />
    );
  };

  const renderTabBar = ({ routeName, selectedTab, navigate }) => {
    return (
      <TouchableOpacity
        onPress={() => navigate(routeName)}
        style={styles.tabButton}
      >
        {_renderIcon(routeName, selectedTab)}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <CurvedBottomBarExpo.Navigator
        style={styles.bottomBar}
        height={65}
        circleWidth={55}
        bgColor="#1A1A23"
        initialRouteName="Home"
        borderTopLeftRight
        renderCircle={({ selectedTab, navigate }) => (
          <Animated.View style={styles.circleContainer}>
            <TouchableOpacity
              style={styles.btnCircle}
              onPress={() => {}}
            >
              <Ionicons name={"add"} color="white" size={25} />
            </TouchableOpacity>
          </Animated.View>
        )}
        tabBar={renderTabBar}
      >
        <CurvedBottomBarExpo.Screen
          name="Home"
          position="LEFT"
          component={HomeStack}
          options={{ headerShown: false }}
        />
        <CurvedBottomBarExpo.Screen
          name="Search"
          position="LEFT"
          component={SearchScreen}
          options={{ headerShown: false }}
        />
        <CurvedBottomBarExpo.Screen
          name="Map"
          position="RIGHT"
          component={MapScreen}
          options={{ headerShown: false }}
        />
        <CurvedBottomBarExpo.Screen
          name="Profile"
          position="RIGHT"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
      </CurvedBottomBarExpo.Navigator>
    </View>
  );
};

export default AnimalTabNavigator;

const styles = StyleSheet.create({
  bottomBar: {
    position: "absolute",
    borderRadius: 20,
    elevation: 1000,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0.5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  btnCircle: {
    width: 60,
    height: 60,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
    padding: 10,
    shadowColor: "#1A1A23",
    shadowOffset: {
      width: 0,
      height: 0.5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 0.41,
    elevation: 1,
  },
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 30,
  },
  tabButton: {
    flex: 1,
    borderColor: "black",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
});
