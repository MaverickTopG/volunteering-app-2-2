import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

// Baseline dimensions (iPhone 16 Pro Max as an example)
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get('window');

const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

// Categories (alphabetically sorted)
let categories = [
  { id: '1', title: 'Animals', icon: 'paw-outline', reference: 'Animal' },
  { id: '2', title: 'Arts', icon: 'color-palette-outline', reference: 'Arts' },
  { id: '4', title: 'Family', icon: 'people-circle-outline', reference: 'Family' },
  { id: '5', title: 'Tech', icon: 'laptop-outline', reference: 'Tech' },
  { id: '6', title: 'Education', icon: 'school-outline', reference: 'Education' },
  { id: '7', title: 'Environs', icon: 'leaf-outline', reference: 'Environment' },
  { id: '8', title: 'Hospital', icon: 'medkit-outline', reference: 'Hospital' },
  { id: '9', title: 'Library', icon: 'book-outline', reference: 'Library' },
  { id: '11', title: 'Seniors', icon: 'walk-outline', reference: 'Seniors' },
];

categories.sort((a, b) => a.title.localeCompare(b.title));

export default function CausesScreen() {
  const navigation = useNavigation();
  const flatListRef = useRef(null);

  // Create an Animated.Value for each category
  const animations = useRef(categories.map(() => new Animated.Value(0))).current;

  // Re-run the animation each time this screen is focused, and scroll the FlatList back to the top.
  useFocusEffect(
    React.useCallback(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: false });
      }
      animations.forEach((anim) => anim.setValue(0));

      const slideInAnimations = animations.map((anim, index) => {
        const fromValue = index % 2 === 0 ? -width : width;
        return Animated.timing(anim, {
          toValue: 1,
          duration: 700,
          delay: index * 10,
          useNativeDriver: true,
        });
      });

      Animated.stagger(100, slideInAnimations).start();
    }, [animations])
  );

  const handleCategoryPress = (cat) => {
    navigation.navigate('Search', {
      screen: 'Carousel',
      params: { reference: cat.reference, carouselName: cat.title },
    });
  };

  const renderItem = ({ item, index }) => {
    const fromValue = index % 2 === 0 ? -width : width;
    const translateX = animations[index].interpolate({
      inputRange: [0, 1],
      outputRange: [fromValue, 0],
    });
    const scaleAnim = animations[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
      extrapolate: 'clamp',
    });
    const opacity = animations[index].interpolate({
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
          },
        ]}
      >
        <TouchableOpacity onPress={() => handleCategoryPress(item)}>
          {/* Outer container: border with gradient */}
          <LinearGradient
            colors={['#fff0d4', '#ffe8c9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBorder}
          >
            {/* Inner container remains a solid background */}
            <View style={styles.cardContent}>
              <LinearGradient
                colors={['#fff6e7', '#ffe8c9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientIconContainer}
              >
                <Ionicons name={item.icon} size={scale(28)} color="#333" />
              </LinearGradient>
              <Text style={styles.itemText}>{item.title}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.rootContainer}>
      {/* Header container with translucent background */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Volunteer Causes</Text>
      </View>

      {/* Main content area */}
      <View style={styles.listContainer}>
        <FlatList
          ref={flatListRef}
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#fff6e7',
  },
  headerContainer: {
    height: verticalScale(80),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,246,231,0.2)', // Reduced opacity for a translucent effect
    shadowColor: '#ffe8c9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  headerText: {
    fontSize: scale(22),
    fontWeight: '700',
    color: '#333',
  },
  listContainer: {
    flex: 1,
    marginTop: verticalScale(10),
  },
  flatListContent: {
    paddingBottom: verticalScale(120),
  },
  columnWrapper: {
    justifyContent: 'center',
  },
  item: {
    width: scale(180),
    margin: scale(10),
    borderRadius: scale(12),
    shadowColor: '#ffe8c9',
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
    backgroundColor: '#fff6e7',
    borderRadius: scale(10),
    paddingVertical: verticalScale(20),
    alignItems: 'center',
  },
  gradientIconContainer: {
    width: scale(62),
    height: scale(62),
    borderRadius: scale(31),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  itemText: {
    fontSize: scale(16),
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },
});
