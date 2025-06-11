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

const getResponsiveValues = () => {
  const screenRatio = width / height;
  const isSmallScreen = width < 400;
  const isMediumScreen = width >= 400 && width < 450;
  
  return {
    itemMargin: isSmallScreen ? 6 : 8,
    headerTopPercentage: screenRatio > 0.5 ? "8%" : "10%",
    gridHeaderTopPercentage: screenRatio > 0.5 ? "3%" : "5%",
    cardWidthMultiplier: isSmallScreen ? 0.85 : 0.8,
    cardHeightMultiplier: isSmallScreen ? 0.65 : 0.6,
    headerHeight: isSmallScreen ? 50 : 56,
    gridHeaderHeight: isSmallScreen ? 80 : 96,
    carouselFontSize: isSmallScreen ? 28 : isMediumScreen ? 30 : 32,
    gridFontSize: isSmallScreen ? 24 : isMediumScreen ? 26 : 28,
    cardTitleSize: isSmallScreen ? 28 : isMediumScreen ? 30 : 32,
    gridCardTitleSize: isSmallScreen ? 14 : 16,
    topOffset: isSmallScreen ? 40 : 60,
    cardTopOffset: isSmallScreen ? "-3%" : "-5%",
  };
};

const responsive = getResponsiveValues();
const ITEM_MARGIN = responsive.itemMargin;
const ITEM_WIDTH = (width - ITEM_MARGIN * 3) / 2;
const ITEM_ASPECT = 4 / 3;

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
  const [isGridView, setIsGridView] = useState(false);

  const onMomentumScrollEnd = (e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    setCurrentIndex(newIndex);
  };

  const navigateToCategory = (index) => {
    const causeId = causeNames[index];
    navigation.navigate("Carousel", {
      category: causeId,
      stateCode: "CA",
    });
  };

  const toggleView = () => {
    setIsGridView((prev) => !prev);
  };

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

  const renderGrid = () => {
    const statusBarHeight = StatusBar.currentHeight || 0;
    const topOffset = statusBarHeight + responsive.gridHeaderHeight + responsive.topOffset;

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
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {rows.map((rowIndices, rowIndex) => (
          <View key={rowIndex} style={styles.gridRow}>
            {rowIndices.length === 2 ? (
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
        <>
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
        <>
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

          {renderGrid()}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  headerContainerCarousel: {
    position: "absolute",
    top: responsive.headerTopPercentage,
    left: 16,
    right: 16,
    height: responsive.headerHeight,
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
    fontSize: responsive.carouselFontSize,
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

  fullScreenItem: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },
  cardWrapper: {
    width: width * responsive.cardWidthMultiplier,
    height: height * responsive.cardHeightMultiplier,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 12,
    top: responsive.cardTopOffset,
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
    fontSize: responsive.cardTitleSize,
    color: "#FFF",
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  leftArrow: {
    position: "absolute",
    left: "0.5%",
    top: height / 2 - 16,
    zIndex: 20,
  },
  rightArrow: {
    position: "absolute",
    right: "0.5%",
    top: height / 2 - 16,
    zIndex: 20,
  },

  headerContainerGrid: {
    position: "absolute",
    top: responsive.gridHeaderTopPercentage,
    left: 0,
    right: 0,
    height: responsive.gridHeaderHeight,
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
    fontSize: responsive.gridFontSize,
    fontWeight: "700",
  },
  menuButtonGrid: {
    position: "absolute",
    right: 16,
    padding: 4,
  },

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
    fontSize: responsive.gridCardTitleSize,
    color: "#FFF",
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: "center",
  },
});