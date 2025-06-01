// SearchScreen.js

import React, { useState, useRef, useEffect, useContext } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  FlatList,
  ImageBackground,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../../auth/AuthContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── CONSTANTS FOR EXACT DIMENSIONS ─────────────────────────────────

// Search bar:
const SEARCH_BAR_HEIGHT = 50;
const SEARCH_BAR_BORDER_RADIUS = 25;
const SEARCH_BAR_HORIZONTAL_MARGIN = 20;

// “Select your next trip” text:
const SECTION_TOP_MARGIN = 16;
const SECTION_SIDE_MARGIN = 20;
const SECTION_FONT_SIZE = 24;

// Category pills:
const PILL_HEIGHT = 32;
const PILL_BORDER_RADIUS = 16;
const PILL_HORIZONTAL_PADDING = 16;
const PILL_SPACING = 8;
const PILL_FONT_SIZE = 14;

// Card dimensions: 90% of screen width, 45% of screen height
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.45;
const CARD_BORDER_RADIUS = 24;
const CARD_SPACING = (SCREEN_WIDTH - CARD_WIDTH) / 2;

// “See more” blur pill inside card:
const SEE_MORE_HEIGHT = 50;
const SEE_MORE_BORDER_RADIUS = 25;
const SEE_MORE_HORIZONTAL_PADDING = 16;

// Heart icon container:
const HEART_DIAMETER = 36;

// ─── SAMPLE CATEGORY LABELS (Asia, Europe, etc.) ───────────────────
const categories = ["Asia", "Europe", "South America", "North America"];

// ─── SAMPLE CAROUSEL DATA ───────────────────────────────────────────
const trips = [
  {
    id: "1",
    region: "Brazil",
    name: "Rio de Janeiro",
    rating: 5.0,
    reviews: 143,
    image:
      "https://images.unsplash.com/photo-1585338325065-0c2e6c57d6a3?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "2",
    region: "France",
    name: "Paris",
    rating: 4.8,
    reviews: 212,
    image:
      "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "3",
    region: "Japan",
    name: "Tokyo",
    rating: 4.9,
    reviews: 198,
    image:
      "https://images.unsplash.com/photo-1568817410669-212e17f42d20?auto=format&fit=crop&w=800&q=60",
  },
  // …add more items as needed…
];

export default function SearchScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const carouselRef = useRef(null);

  // Optional: load a theme palette from AsyncStorage
  const DEFAULT_PALETTE = ["#FFF6E7", "#FFF0D4", "#FFE8C9", "#333"];
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  const [loadingTheme, setLoadingTheme] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoadingTheme(false);
      return;
    }
    AsyncStorage.getItem(`@shop/active-${user.uid}`)
      .then((id) => {
        if (!id) return;
        // If you have themePacks or seasonal, load colors here:
        // const pack = themePacks.find((t) => t.id === id) || seasonal.find((s) => s.id === id);
        // if (pack && Array.isArray(pack.colors)) {
        //   const c = pack.colors;
        //   setPalette([c[0]||DEFAULT_PALETTE[0], c[1]||DEFAULT_PALETTE[1], c[2]||DEFAULT_PALETTE[2], c[3]||DEFAULT_PALETTE[3]]);
        // }
      })
      .catch(console.warn)
      .finally(() => setLoadingTheme(false));
  }, [user]);

  // Scroll to first card on mount
  useEffect(() => {
    setTimeout(() => {
      carouselRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, 50);
  }, []);

  // Handler for “See more” – navigate to Ordix (adjust route names as needed)
  const handleSeeMore = (tripItem) => {
    navigation.navigate("Ordix", {
      screen: "SearchScreen", // or the correct nested route within Ordix
      params: { reference: tripItem.id, name: tripItem.name },
    });
  };

  // Render a single category pill
  const renderCategory = ({ item }) => {
    const isSelected = item === categories[2]; // default “South America” example
    return (
      <TouchableOpacity
        style={[
          styles.pill,
          isSelected && styles.pillSelected,
          { marginRight: PILL_SPACING },
        ]}
        activeOpacity={0.8}
      >
        <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render one trip card in the horizontal FlatList
  const renderTripCard = ({ item }) => {
    return (
      <View style={styles.cardContainer}>
        <ImageBackground
          source={{ uri: item.image }}
          style={styles.cardImage}
          imageStyle={styles.cardImageStyle}
        >
          {/* Heart icon (top-right) */}
          <TouchableOpacity
            style={styles.heartContainer}
            activeOpacity={0.8}
          >
            <AntDesign name="hearto" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Bottom info + “See more” blurred pill */}
          <View style={styles.cardInfoContainer}>
            <Text style={styles.regionText}>{item.region}</Text>
            <Text style={styles.destinationText}>{item.name}</Text>
            <View style={styles.ratingRow}>
              <AntDesign
                name="star"
                size={16}
                color="#fff"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.ratingText}>
                {item.rating.toFixed(1)} ({item.reviews} reviews)
              </Text>
            </View>

            {/* Blurred “See more” button, exactly 50px tall, full‐width minus padding */}
            <BlurView
              intensity={50}
              tint="dark"
              style={styles.seeMoreBlur}
            >
              <TouchableOpacity
                onPress={() => handleSeeMore(item)}
                style={styles.seeMoreButton}
                activeOpacity={0.8}
              >
                <Text style={styles.seeMoreText}>See more</Text>
                <AntDesign
                  name="arrowright"
                  size={16}
                  color="#fff"
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>
            </BlurView>
          </View>
        </ImageBackground>
      </View>
    );
  };

  // Show a loading spinner until the palette is loaded (if you’re using themes)
  if (loadingTheme) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: DEFAULT_PALETTE[0] }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DEFAULT_PALETTE[3]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette[0] }]}
    >
      {/* ─── HEADER: “Hello, Vanessa” / “Welcome to TripGlide” / Avatar ───── */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.greetingText}>Hello, Vanessa</Text>
          <Text style={styles.subGreetingText}>
            Welcome to TripGlide
          </Text>
        </View>
        <ImageBackground
          source={{
            uri:
              "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60",
          }}
          style={styles.avatar}
          imageStyle={{ borderRadius: 25 }}
        />
      </View>

      {/* ─── SEARCH BAR ─────────────────────────────────────────────────── */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            {
              borderRadius: SEARCH_BAR_BORDER_RADIUS,
              height: SEARCH_BAR_HEIGHT,
            },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color="#999"
            style={{ marginLeft: 16, marginRight: 8 }}
          />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#999"
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              width: SEARCH_BAR_HEIGHT,
              height: SEARCH_BAR_HEIGHT,
              borderRadius: SEARCH_BAR_BORDER_RADIUS,
            },
          ]}
          activeOpacity={0.8}
        >
          <Ionicons name="options-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ─── SECTION TITLE: “Select your next trip” ─────────────────────── */}
      <View
        style={[
          styles.sectionHeader,
          { marginTop: SECTION_TOP_MARGIN, marginHorizontal: SECTION_SIDE_MARGIN },
        ]}
      >
        <Text
          style={[
            styles.sectionTitle,
            { fontSize: SECTION_FONT_SIZE },
          ]}
        >
          Select your next trip
        </Text>
      </View>

      {/* ─── CATEGORY PILLS ─────────────────────────────────────────────── */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(i) => i}
          renderItem={renderCategory}
          contentContainerStyle={{ paddingHorizontal: SECTION_SIDE_MARGIN }}
        />
      </View>

      {/* ─── HORIZONTAL CAROUSEL OF CARDS ───────────────────────────────── */}
      <FlatList
        ref={carouselRef}
        data={trips}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        keyExtractor={(item) => item.id}
        renderItem={renderTripCard}
        contentContainerStyle={{
          paddingLeft: CARD_SPACING / 2,
          paddingBottom: 20,
        }}
      />
    </SafeAreaView>
  );
}

// ─── STYLES ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // HEADER (Hello, Vanessa / Welcome to TripGlide / Avatar)
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  greetingText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111",
  },
  subGreetingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  // SEARCH BAR
  searchContainer: {
    flexDirection: "row",
    marginTop: 20,
    paddingHorizontal: SEARCH_BAR_HORIZONTAL_MARGIN,
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 0, // so text is vertically centered
    paddingRight: 16,
  },
  filterButton: {
    marginLeft: 12,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },

  // SECTION TITLE
  sectionHeader: {
    // margins set inline
  },
  sectionTitle: {
    fontWeight: "700",
    color: "#111",
  },

  // CATEGORY PILLS
  categoriesWrapper: {
    marginTop: PILL_SPACING,
  },
  pill: {
    height: PILL_HEIGHT,
    borderRadius: PILL_BORDER_RADIUS,
    paddingHorizontal: PILL_HORIZONTAL_PADDING,
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  pillSelected: {
    backgroundColor: "#111",
    borderColor: "#111",
  },
  pillText: {
    fontSize: PILL_FONT_SIZE,
    color: "#333",
  },
  pillTextSelected: {
    color: "#fff",
  },

  // CARD STYLING
  cardContainer: {
    marginRight: CARD_SPACING,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: CARD_BORDER_RADIUS,
    overflow: "hidden",
    backgroundColor: "#eee",
  },
  cardImage: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardImageStyle: {
    borderRadius: CARD_BORDER_RADIUS,
  },
  heartContainer: {
    alignSelf: "flex-end",
    margin: 16,
    width: HEART_DIAMETER,
    height: HEART_DIAMETER,
    borderRadius: HEART_DIAMETER / 2,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfoContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  regionText: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 4,
  },
  destinationText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  ratingText: {
    color: "#fff",
    fontSize: 14,
  },
  seeMoreBlur: {
    marginTop: 12,
    borderRadius: SEE_MORE_BORDER_RADIUS,
    overflow: "hidden",
  },
  seeMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: SEE_MORE_BORDER_RADIUS,
    paddingVertical: (SEE_MORE_HEIGHT * 0.4), // ~20px vertically to total 50px
    paddingHorizontal: SEE_MORE_HORIZONTAL_PADDING,
    alignSelf: "flex-start",
  },
  seeMoreText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
