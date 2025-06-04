// /src/screens/VolunteerCausesScreen.js

import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

//── GRID LAYOUT CONSTANTS ───────────────────────────────────────────
// Two columns: each card is ITEM_WIDTH wide. We leave ITEM_MARGIN
// on the left/right of each card, plus ITEM_MARGIN between cards.
const ITEM_MARGIN = 8; 
const ITEM_WIDTH = (width - ITEM_MARGIN * 3) / 2; // two cards + three margins
const ITEM_ASPECT = 4 / 3; // aspect ratio: width : height = 4 : 3

// Nine cause images
const data = [
  require("../../assets/animal.png"),
  require("../../assets/art.png"),
  require("../../assets/education.png"),
  require("../../assets/enviroment.png"),
  require("../../assets/family.png"),
  require("../../assets/hospital.png"),
  require("../../assets/library.png"),
  require("../../assets/seniors.png"),
  require("../../assets/tech.png"),
];

// Nine cause names
const causeNames = [
  "Animal",
  "Arts",
  "Education",
  "Environment",
  "Family",
  "Hospital",
  "Library",
  "Seniors",
  "Tech",
];

export default function VolunteerCausesScreen() {
  const navigation = useNavigation();
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // false = carousel mode, true = grid mode
  const [isGridView, setIsGridView] = useState(false);

  // Carousel: update index on swipe end
  const onMomentumScrollEnd = (e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    setCurrentIndex(newIndex);
  };

  // Navigate to category detail
  const navigateToCategory = (index) => {
    const causeId = causeNames[index];
    navigation.navigate("Carousel", {
      category: causeId,
      stateCode: "CA",
    });
  };

  // Toggle between carousel and grid
  const toggleView = () => {
    setIsGridView((prev) => !prev);
  };

  // Render a single carousel card
  const renderCarouselItem = ({ item, index }) => (
    <View style={styles.fullScreenItem}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigateToCategory(index)}
        style={styles.cardWrapper}
      >
        <Image source={item} style={styles.cardImage} resizeMode="cover" />
        <View style={styles.overlay}>
          <Text style={styles.cardTitle}>{causeNames[index]}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Render all nine cards in a 3×3 grid by manually chunking into rows of 2
  const renderGrid = () => {
    // Calculate how far down to push the grid so it sits below the header
    const statusBarHeight = StatusBar.currentHeight || 0;
    const headerHeight = 56;
    const topOffset = statusBarHeight + headerHeight+60;

    // Break data into rows of two indices each
    const rows = [];
    for (let i = 0; i < data.length; i += 2) {
      if (i + 1 < data.length) {
        rows.push([i, i + 1]);
      } else {
        rows.push([i]);
      }
    }

    return (
      <ScrollView
        style={styles.gridScrollView}
        contentContainerStyle={{
          paddingTop: topOffset,
          paddingBottom: 100, // enough bottom padding so last card can scroll up
        }}
        showsVerticalScrollIndicator={false}
      >
        {rows.map((rowIndices, rowIndex) => (
          <View key={rowIndex} style={styles.gridRow}>
            {rowIndices.length === 2 ? (
              // Two cards side by side
              rowIndices.map((idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.gridCardWrapper}
                  activeOpacity={0.8}
                  onPress={() => navigateToCategory(idx)}
                >
                  <Image
                    source={data[idx]}
                    style={styles.gridCardImage}
                    resizeMode="cover"
                  />
                  <View style={styles.gridOverlay}>
                    <Text style={styles.gridCardTitle}>{causeNames[idx]}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              // Single (last) card: center it in its row
              <View style={styles.gridSingleWrapper}>
                <TouchableOpacity
                  key={rowIndices[0]}
                  style={styles.gridCardWrapper}
                  activeOpacity={0.8}
                  onPress={() => navigateToCategory(rowIndices[0])}
                >
                  <Image
                    source={data[rowIndices[0]]}
                    style={styles.gridCardImage}
                    resizeMode="cover"
                  />
                  <View style={styles.gridOverlay}>
                    <Text style={styles.gridCardTitle}>
                      {causeNames[rowIndices[0]]}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isGridView ? "dark-content" : "light-content"}
        translucent
        backgroundColor="transparent"
      />

      {!isGridView ? (
        // ── CAROUSEL MODE ───────────────────────────────────────────────
        <>
          {/* 1) Blurred background behind each card */}
          <View style={StyleSheet.absoluteFill}>
            {data.map((src, idx) => {
              const inputRange = [
                (idx - 1) * width,
                idx * width,
                (idx + 1) * width,
              ];
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0, 1, 0],
                extrapolate: "clamp",
              });
              return (
                <Animated.Image
                  key={idx}
                  source={src}
                  style={[StyleSheet.absoluteFill, { opacity }]}
                  blurRadius={50}
                  resizeMode="cover"
                />
              );
            })}
          </View>

          {/* 2) Absolute header (over the blurred background) */}
          <View style={styles.headerContainerCarousel}>
            <Text style={styles.headerTitleCarousel}>Volunteer Causes</Text>
            <TouchableOpacity
              onPress={toggleView}
              style={styles.menuButtonCarousel}
              activeOpacity={0.7}
            >
              <Ionicons name="menu" size={28} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* 3) Horizontal FlatList for carousel cards */}
          <Animated.FlatList
            ref={scrollRef}
            data={data}
            keyExtractor={(_, i) => i.toString()}
            horizontal
            pagingEnabled
            decelerationRate="fast"
            bounces={false}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumScrollEnd}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            renderItem={renderCarouselItem}
          />

          {/* 4) Left/Right navigation arrows */}
          {currentIndex > 0 && (
            <TouchableOpacity
              style={styles.leftArrow}
              activeOpacity={0.7}
              onPress={() => {
                const prev = currentIndex - 1;
                scrollRef.current.scrollToOffset({
                  offset: prev * width,
                  animated: true,
                });
                setCurrentIndex(prev);
              }}
            >
              <Ionicons name="chevron-back" size={32} color="#FFF" />
            </TouchableOpacity>
          )}
          {currentIndex < data.length - 1 && (
            <TouchableOpacity
              style={styles.rightArrow}
              activeOpacity={0.7}
              onPress={() => {
                const next = currentIndex + 1;
                scrollRef.current.scrollToOffset({
                  offset: next * width,
                  animated: true,
                });
                setCurrentIndex(next);
              }}
            >
              <Ionicons name="chevron-forward" size={32} color="#FFF" />
            </TouchableOpacity>
          )}
        </>
      ) : (
        // ── GRID MODE ───────────────────────────────────────────────────
        <>
          {/* 1) Absolute header over a white background */}
          <View style={styles.headerContainerGrid}>
            <Text style={styles.headerTitleGrid}>Volunteer Causes</Text>
            <TouchableOpacity
              onPress={toggleView}
              style={styles.menuButtonGrid}
              activeOpacity={0.7}
            >
              <Ionicons name="menu" size={28} color="#000" />
            </TouchableOpacity>
          </View>

          {/* 2) Scrollable 3×3 grid of nine cards */}
          {renderGrid()}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ── SCREEN CONTAINER ─────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: "#FFF", // ensure pure white background in grid mode
  },

  // ── CAROUSEL HEADER (ABSOLUTE) ───────────────────────────────────
  headerContainerCarousel: {
    position: "absolute",
    top: StatusBar.currentHeight || 90,
    left: 16,
    right: 16,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    zIndex: 10,
  },
  headerTitleCarousel: {
    flex: 1,
    textAlign: "center",
    color: "#FFF",
    fontSize: 28,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  menuButtonCarousel: {
    position: "absolute",
    right: 0,
    padding: 4,
  },

  // ── CAROUSEL ITEM ─────────────────────────────────────────────────
  fullScreenItem: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },
  cardWrapper: {
    width: width * 0.8,
    height: height * 0.6,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 12,
    top:-40
    
  },
  cardImage: {
    width: "100%",
    height: "100%",
    
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 32,
    color: "#FFF",
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  leftArrow: {
    position: "absolute",
    left: 2,
    top: height / 2 - 16,
    zIndex: 20,
  },
  rightArrow: {
    position: "absolute",
    right: 2,
    top: height / 2 - 16,
    zIndex: 20,
  },

  // ── GRID HEADER (ABSOLUTE) ────────────────────────────────────────
  headerContainerGrid: {
    position: "absolute",
    top: StatusBar.currentHeight || 60,
    left: 0,
    right: 0,
    height: 96,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitleGrid: {
    flex: 1,
    textAlign: "center",
    color: "#000",
    fontSize: 28,
    fontWeight: "700",
  },
  menuButtonGrid: {
    position: "absolute",
    right: 16,
    padding: 4,
  },

  // ── GRID MODE: 3×3 SMALL RECTANGULAR CARDS ────────────────────────
  containerGrid: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  gridScrollView: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: ITEM_MARGIN,
    paddingHorizontal: ITEM_MARGIN,
  },
  gridSingleWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: ITEM_MARGIN,
  },
  gridCardWrapper: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * ITEM_ASPECT * (3/4), 
    // to maintain 4:3 (width:height), use height = width * 3/4
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  gridCardImage: {
    ...StyleSheet.absoluteFillObject,
    width: null,
    height: null,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  gridCardTitle: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: "center",
  },
});
