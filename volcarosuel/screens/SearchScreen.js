// /src/screens/VolunteerCausesScreen.js

import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  FlatList,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

// Array of image imports for each cause
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

export default function VolunteerCausesScreen() {
  const navigation = useNavigation();
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Update currentIndex when swipe ends; do NOT navigate here
  const onMomentumScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  // Navigate when card is tapped
  const onCardPress = (index) => {
    const causeId = [
      "Animal",
      "Arts",
      "Education",
      "Environment",
      "Family",
      "Hospital",
      "Library",
      "Seniors",
      "Tech",
    ][index];
    navigation.navigate("Carousel", {
      category: causeId,
      stateCode: "CA",
    });
  };

  // Programmatically scroll to a given card index
  const goToIndex = (idx) => {
    if (scrollRef.current) {
      scrollRef.current.scrollToOffset({ offset: idx * width, animated: true });
      setCurrentIndex(idx);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* SMOOTHLY BLURRED BACKGROUND FOR CURRENT CARD */}
      <View style={StyleSheet.absoluteFill}>
        {data.map((imageSource, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
            extrapolate: "clamp",
          });
          return (
            <Animated.Image
              key={index}
              source={imageSource}
              style={[StyleSheet.absoluteFill, { opacity }]}
              blurRadius={50}
              resizeMode="cover"
            />
          );
        })}
      </View>

      {/* HEADER: “Volunteer Causes” */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Volunteer Causes</Text>
      </View>

      {/* HORIZONTAL, PAGING-ENABLED CARDS */}
      <Animated.FlatList
        ref={scrollRef}
        data={data}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        decelerationRate="fast"
        bounces={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        renderItem={({ item, index }) => {
          return (
            <View style={styles.fullScreenItem}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => onCardPress(index)}
                style={styles.cardWrapper}
              >
                <Image
                  source={item}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <View style={styles.overlay}>
                  <Text style={styles.cardTitle}>
                    {[
                      "Animal",
                      "Arts",
                      "Education",
                      "Environment",
                      "Family",
                      "Hospital",
                      "Library",
                      "Seniors",
                      "Tech",
                    ][index]}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* LEFT ARROW (only if not on first) */}
      {currentIndex > 0 && (
        <TouchableOpacity
          style={styles.leftArrow}
          activeOpacity={0.7}
          onPress={() => goToIndex(currentIndex - 1)}
        >
          <Ionicons name="chevron-back" size={32} color="#fff" />
        </TouchableOpacity>
      )}

      {/* RIGHT ARROW (only if not on last) */}
      {currentIndex < data.length - 1 && (
        <TouchableOpacity
          style={styles.rightArrow}
          activeOpacity={0.7}
          onPress={() => goToIndex(currentIndex + 1)}
        >
          <Ionicons name="chevron-forward" size={32} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    position: "absolute",
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 90,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  // Each FlatList item is full screen, centers the card
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
    color: "#FFFFFF",
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  leftArrow: {
    position: "absolute",
    left: 2, // moved further inward
    top: height / 2 - 16,
    zIndex: 20,
  },
  rightArrow: {
    position: "absolute",
    right: 2, // moved further inward
    top: height / 2 - 16,
    zIndex: 20,
  },
});
