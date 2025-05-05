// App.js
import "react-native-gesture-handler";
import "react-native-reanimated";
import React, { useEffect, useState, useRef } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { NavigationContainer } from "@react-navigation/native";
import { registerRootComponent } from "expo";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AuthProvider } from "./auth/AuthContext";
import DrawerNavigator from "./navigation/drawer";
import AppUpdateChecker from "./AppUpdateChecker";
import { themePacks, seasonal } from "./volcarosuel/screens/shop";

SplashScreen.preventAutoHideAsync();

const DEFAULT_PALETTE = ["#FFF6E7", "#FFF0D4", "#FFE8C9", "#333333"];

function App() {
  // ** splash fade **
  const [showSplash, setShowSplash] = useState(true);
  const fade = useRef(new Animated.Value(1)).current;

  // ** theme loader **
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  const [loadingTheme, setLoadingTheme] = useState(true);

  // — splash + OTA —
  useEffect(() => {
    AppUpdateChecker();
    (async () => {
      // keep splash visible briefly
      await new Promise((r) => setTimeout(r, 1500));
      await SplashScreen.hideAsync();
      Animated.timing(fade, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setShowSplash(false));
    })();
  }, []);

  // — load active theme from AsyncStorage —
  useEffect(() => {
    (async () => {
      try {
        // assume you store the user object somewhere in AsyncStorage under "user"
        const userJson = await AsyncStorage.getItem("user");
        const uid = userJson ? JSON.parse(userJson).uid : null;
        if (!uid) {
          setPalette(DEFAULT_PALETTE);
        } else {
          const key = `@shop/active-${uid}`;
          const id = await AsyncStorage.getItem(key);
          if (id) {
            const all = [...themePacks, ...seasonal];
            const pack = all.find((p) => p.id === id);
            if (pack?.colors?.length === 4) {
              setPalette(pack.colors);
            } else {
              setPalette(DEFAULT_PALETTE);
            }
          } else {
            setPalette(DEFAULT_PALETTE);
          }
        }
      } catch (e) {
        console.warn("Theme load error", e);
        setPalette(DEFAULT_PALETTE);
      } finally {
        setLoadingTheme(false);
      }
    })();
  }, []);

  if (loadingTheme) {
    // you could render a loading spinner here if you like
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette[0] }}>
      <BottomSheetModalProvider>
        <AuthProvider>
          <NavigationContainer>
            {/*
              Pass the palette down via screenProps so all your screens
              can grab it from `props.screenProps.palette`
            */}
            <DrawerNavigator screenProps={{ palette }} />
          </NavigationContainer>
        </AuthProvider>
      </BottomSheetModalProvider>

      {showSplash && (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
          <Image
            source={require("./assets/splashscreen.jpg")}
            style={styles.splashImage}
          />
        </Animated.View>
      )}
    </GestureHandlerRootView>
  );
}

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
