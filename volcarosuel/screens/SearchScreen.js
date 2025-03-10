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
import { BlurView } from 'expo-blur';

// Baseline dimensions (iPhone 16 Pro Max as an example)
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get('window');

const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

// Categories (alphabetically sorted)
let categories = [
  { id: '1',  title: 'Animals',    icon: 'paw-outline',            reference: 'Animal' },
  { id: '2',  title: 'Arts',       icon: 'color-palette-outline',  reference: 'Arts' },
  { id: '4',  title: 'Family',    icon: 'people-circle-outline',  reference: 'Family' },
  { id: '5',  title: 'Tech',       icon: 'laptop-outline',         reference: 'Tech' },
  { id: '6',  title: 'Education',  icon: 'school-outline',         reference: 'Education' },
  { id: '7',  title: 'Environs',    icon: 'leaf-outline',           reference: 'Environment' },
  { id: '8',  title: 'Hospital',     icon: 'medkit-outline',         reference: 'Hospital' },
  { id: '9',  title: 'Library',    icon: 'book-outline',           reference: 'Library' },
  { id: '11', title: 'Seniors',    icon: 'walk-outline',           reference: 'Seniors' },
];

categories.sort((a, b) => a.title.localeCompare(b.title));

export default function CausesScreen() {
  const navigation = useNavigation();
  const flatListRef = useRef(null);

  // Create an Animated.Value for each category
  const animations = useRef(categories.map(() => new Animated.Value(0))).current;

  // Re-run the animation each time this screen is focused,
  // and scroll the FlatList back to the top.
  useFocusEffect(
    React.useCallback(() => {
      // Reset FlatList scroll to top
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: false });
      }

      // Reset all animations to 0
      animations.forEach((anim) => anim.setValue(0));

      // Staggered slide-in for each item
      const slideInAnimations = animations.map((anim, index) => {
        // Even index => animate from left; odd index => animate from right
        const fromValue = index % 2 === 0 ? -width : width;

        return Animated.timing(anim, {
          toValue: 1,
          duration: 700,
          delay: index * 10, // slight stagger
          useNativeDriver: true,
        });
      });

      Animated.stagger(100, slideInAnimations).start();
    }, [animations])
  );

  const handleCategoryPress = (cat) => {
    navigation.navigate('CarouselStack', {
      carouselName: cat.title,
      reference: cat.reference,
    });
  };

  // Render each item in the FlatList
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

    return (
      <Animated.View
        style={[
          styles.item,
          {
            transform: [
              { translateX },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <TouchableOpacity onPress={() => handleCategoryPress(item)}>
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon} size={scale(28)} color="#333" />
          </View>
          <Text style={styles.itemText}>{item.title}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.rootContainer}>
      {/* Absolute BlurView behind the header text */}
      <BlurView style={styles.blurHeader} intensity={80} tint="light">
        <Text style={styles.headerText}>Volunteer Causes</Text>
      </BlurView>

      {/* Main content area with #fff6e7 background */}
      <View style={styles.listContainer}>
        <FlatList
          ref={flatListRef}
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'center' }}
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
  blurHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: verticalScale(80),
    zIndex: 999, // ensure it's above the list
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: scale(22),
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    flex: 1,
    // Add top margin so the list starts below the blurred header
    marginTop: verticalScale(80),
  },
  flatListContent: {
    // Extra bottom padding so cards don't collide with bottom tabs
    paddingBottom: verticalScale(120),
  },
  item: {
    // Slightly wider for comfortable centering
    width: scale(180),
    margin: scale(10),
    backgroundColor: '#fff6e7',
    borderRadius: scale(12),
    paddingVertical: verticalScale(20),
    borderWidth: scale(1),
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    // Larger container to ensure icons are centered
    width: scale(62),
    height: scale(62),
    borderRadius: scale(31),
    backgroundColor: '#fff6e7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(10),
    borderWidth: scale(1),
    borderColor: '#ddd',
  },
  itemText: {
    fontSize: scale(16),
    color: '#333',
    textAlign: 'center',
  },
});
