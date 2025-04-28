// CausesScreen.js
import React, {
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ---- Bring in your AuthContext correctly ----
// If you used `export const AuthContext = createContext(...)`:
import { AuthContext } from "../../auth/AuthContext";
// If you used `export default AuthContext;`, switch to:
// import AuthContext from "../../auth/AuthContext";

import { themePacks, seasonal } from "../screens/shop";

const { width, height } = Dimensions.get("window");
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const scale = (s) => (width / guidelineBaseWidth) * s;
const verticalScale = (s) => (height / guidelineBaseHeight) * s;

// Categories (sorted alphabetically)
let categories = [
  { id: "1", title: "Animals", icon: "paw-outline", reference: "Animal" },
  { id: "2", title: "Arts", icon: "color-palette-outline", reference: "Arts" },
  { id: "4", title: "Family", icon: "people-circle-outline", reference: "Family" },
  { id: "5", title: "Tech", icon: "laptop-outline", reference: "Tech" },
  { id: "6", title: "Education", icon: "school-outline", reference: "Education" },
  { id: "7", title: "Environs", icon: "leaf-outline", reference: "Environment" },
  { id: "8", title: "Hospital", icon: "medkit-outline", reference: "Hospital" },
  { id: "9", title: "Library", icon: "book-outline", reference: "Library" },
  { id: "11", title: "Seniors", icon: "walk-outline", reference: "Seniors" },
];
categories.sort((a, b) => a.title.localeCompare(b.title));

export default function CausesScreen() {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const flatListRef = useRef(null);

  // theme palette: [bg, gradStart, gradEnd, text/icon]
  const DEFAULT_PALETTE = ["#FFF6E7", "#FFF0D4", "#FFE8C9", "#333"];
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  const [loadingTheme, setLoadingTheme] = useState(true);

  // Animated values for each card
  const animations = useRef(
    categories.map(() => new Animated.Value(0))
  ).current;

  // 1) Load active theme from AsyncStorage
  useEffect(() => {
    if (!user) {
      setLoadingTheme(false);
      return;
    }
    const key = `@shop/active-${user.uid}`;
    AsyncStorage.getItem(key)
      .then((id) => {
        if (!id) return;
        const pack =
          themePacks.find((t) => t.id === id) ||
          seasonal.find((s) => s.id === id);
        if (pack && Array.isArray(pack.colors)) {
          const c = pack.colors;
          // ensure we have 4 entries
          setPalette([
            c[0] || DEFAULT_PALETTE[0],
            c[1] || DEFAULT_PALETTE[1],
            c[2] || DEFAULT_PALETTE[2],
            c[3] || DEFAULT_PALETTE[3],
          ]);
        }
      })
      .catch(console.warn)
      .finally(() => setLoadingTheme(false));
  }, [user]);

  // 2) Run slide-in animations on focus
  useFocusEffect(
    useCallback(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      animations.forEach((a) => a.setValue(0));

      const tweens = animations.map((anim, idx) => {
        const from = idx % 2 === 0 ? -width : width;
        return Animated.timing(anim, {
          toValue: 1,
          duration: 700,
          delay: idx * 30,
          useNativeDriver: true,
        });
      });
      Animated.stagger(100, tweens).start();
    }, [animations])
  );

  // 3) Handlers
  const handleCategoryPress = (cat) => {
    navigation.navigate("Search", {
      screen: "Carousel",
      params: { reference: cat.reference, carouselName: cat.title },
    });
  };

  // 4) Render a single item
  const renderItem = ({ item, index }) => {
    const anim = animations[index];
    const from = index % 2 === 0 ? -width : width;
    const translateX = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [from, 0],
    });
    const scaleAnim = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
      extrapolate: "clamp",
    });
    const opacity = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View
        style={[
          styles.item,
          {
            opacity,
            transform: [{ translateX }, { scale: scaleAnim }],
            backgroundColor: palette[0],
          },
        ]}
      >
        <TouchableOpacity onPress={() => handleCategoryPress(item)}>
          <LinearGradient
            colors={[palette[1], palette[2]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientBorder, { borderColor: palette[3] }]}
          >
            <View style={styles.cardContent}>
              <LinearGradient
                colors={[palette[0], palette[1]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientIconContainer}
              >
                <Ionicons name={item.icon} size={scale(28)} color={palette[3]} />
              </LinearGradient>
              <Text style={[styles.itemText, { color: palette[3] }]}>
                {item.title}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loadingTheme) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DEFAULT_PALETTE[3]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.rootContainer, { backgroundColor: palette[0] }]}>
      {/* Header */}
      <View
        style={[
          styles.headerContainer,
          { backgroundColor: palette[0], shadowColor: palette[3] },
        ]}
      >
        <Text style={[styles.headerText, { color: palette[3] }]}>
          Volunteer Causes
        </Text>
      </View>

      {/* Grid */}
      <FlatList
        ref={flatListRef}
        data={categories}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    height: verticalScale(80),
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  headerText: {
    fontSize: scale(22),
    fontWeight: "700",
  },
  flatListContent: {
    paddingBottom: verticalScale(120),
    paddingTop: verticalScale(10),
  },
  columnWrapper: {
    justifyContent: "center",
  },
  item: {
    width: scale(180),
    margin: scale(10),
    borderRadius: scale(12),
    shadowOffset: { width: 0, height: scale(3) },
    shadowOpacity: 0.6,
    shadowRadius: scale(6),
    elevation: 6,
  },
  gradientBorder: {
    borderRadius: scale(12),
    padding: scale(2),
  },
  cardContent: {
    backgroundColor: "#FFF6E7",
    borderRadius: scale(10),
    paddingVertical: verticalScale(20),
    alignItems: "center",
  },
  gradientIconContainer: {
    width: scale(62),
    height: scale(62),
    borderRadius: scale(31),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(10),
  },
  itemText: {
    fontSize: scale(16),
    fontWeight: "600",
    textAlign: "center",
  },
});
