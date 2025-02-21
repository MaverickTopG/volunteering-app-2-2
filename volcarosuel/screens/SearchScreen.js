import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For Expo (or use react-native-vector-icons/Ionicons)
import { useNavigation } from '@react-navigation/native';

// Define baseline dimensions (iPhone 16 Pro Max as an example)
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

const categories = [
  { id: '1', title: 'Animal', icon: 'paw-outline', reference: 'Animal' },
  { id: '2', title: 'Environment', icon: 'leaf-outline', reference: 'Environment' },
  { id: '3', title: 'Family', icon: 'people-outline', reference: 'Family' },
  { id: '4', title: 'Library', icon: 'book-outline', reference: 'Library' },
  { id: '5', title: 'Hospital', icon: 'medkit-outline', reference: 'Hospital' },
];

export default function CausesScreen() {
  const navigation = useNavigation();

  const handleCategoryPress = (cat) => {
    navigation.navigate('CarouselStack', { 
      carouselName: cat.title, 
      reference: cat.reference 
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Volunteer Causes</Text>
      <View style={styles.grid}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.item}
            onPress={() => handleCategoryPress(cat)}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={cat.icon} size={scale(28)} color="#333" />
            </View>
            <Text style={styles.itemText}>{cat.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7',
    paddingTop: verticalScale(50),
    alignItems: 'center',
  },
  header: {
    fontSize: scale(24),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: verticalScale(20),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  item: {
    width: '40%',       // Two-column layout
    margin: '5%',       // Spacing around each item
    alignItems: 'center',
    backgroundColor: '#fff6e7',
    borderRadius: scale(12),
    paddingVertical: verticalScale(20),
    borderWidth: scale(1),
    borderColor: '#ccc',
  },
  iconContainer: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
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
