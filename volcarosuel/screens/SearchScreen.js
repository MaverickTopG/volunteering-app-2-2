import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For Expo (or use react-native-vector-icons/Ionicons)
import { useNavigation } from '@react-navigation/native';

const categories = [
  { id: '1', title: 'Animal', icon: 'paw-outline', reference: 'Animal' },
  { id: '2', title: 'Environment', icon: 'leaf-outline', reference: 'Environment' },
  { id: '3', title: 'Family', icon: 'people-outline', reference: 'Family' },
  { id: '4', title: 'Library', icon: 'book-outline', reference: 'Library' },
  { id: '5', title: 'Hospital', icon: 'medkit-outline', reference: 'Hospital' },
];

export default function CausesScreen() {
  const navigation = useNavigation();

  // When a category is pressed, navigate to CarouselStack
  // Passing both the carouselName and reference
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
              <Ionicons name={cat.icon} size={28} color="#333" />
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
    paddingTop: 50,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
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
    borderRadius: 12,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff6e7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});
