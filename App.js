import "react-native-gesture-handler";
import "react-native-reanimated";
import React, { useEffect, useState, useRef } from "react";
import { Animated, Image, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { NavigationContainer } from "@react-navigation/native";
import { registerRootComponent } from "expo";
import * as SplashScreen from "expo-splash-screen";

import { AuthProvider } from "./auth/AuthContext";
import DrawerNavigator from "./navigation/drawer";
import AppUpdateChecker from "./AppUpdateChecker";

// ⭐ push helpers
import {
  registerForLocalPushAsync,
  scheduleDailyGreetings, 
} from "./notifications";

SplashScreen.preventAutoHideAsync();

const App = () => {
  /* OTA */
  useEffect(() => {
    AppUpdateChecker();
  }, []);

  /* animated splash fade */
  const [showSplash, setShowSplash] = useState(true);
  const fade = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    (async () => {
      await new Promise((r) => setTimeout(r, 1500));
      await SplashScreen.hideAsync();
      Animated.timing(fade, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setShowSplash(false));
    })();
  }, [fade]);

  /* local notifications */
  useEffect(() => {
    (async () => {
      if (await registerForLocalPushAsync()) {
        await scheduleDailyGreetings(); 
      }
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <AuthProvider>
          <NavigationContainer>
            <DrawerNavigator />
          </NavigationContainer>
        </AuthProvider>

        {showSplash && (
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
            <Image
              source={require("./assets/splashscreen.jpg")}
              style={styles.splashImage}
            />
          </Animated.View>
        )}
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  splashImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});

registerRootComponent(App);
export default App;
