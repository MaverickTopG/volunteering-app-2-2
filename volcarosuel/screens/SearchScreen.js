import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const DATA = [
  { id: '1', title: 'Animal', name: 'AnimalCarousel' },
  { id: '2', title: 'Environment', name: 'TechCarousel' },
  { id: '3', title: 'Family', name: 'FamilyCarousel' },
  { id: '4', title: 'Hospital', name: 'HospitalCarousel' },
  { id: '5', title: 'Library', name: 'SeniorCarousel' },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const navigation = useNavigation();
  const typingAnimation = useRef(new Animated.Value(0)).current;

  const quote =
    "Volunteering is the ultimate exercise in democracy. You vote in elections once a year, but when you volunteer, you vote every day about the kind of community you want to live in... Category not found";

  useEffect(() => {
    let timeoutId;
    
    if (searchQuery.trim() !== '' && !DATA.some(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))) {
      setDisplayedText('');
      
      timeoutId = setTimeout(() => {
        typingAnimation.setValue(0);
        const listenerId = typingAnimation.addListener(({ value }) => {
          const typedText = quote.substring(0, Math.floor(value));
          setDisplayedText(typedText);
        });

        Animated.timing(typingAnimation, {
          toValue: quote.length,
          duration: 10000,
          useNativeDriver: false,
        }).start(() => {
          typingAnimation.removeListener(listenerId);
          setDisplayedText((prev) => prev + "");
        });
      }, 0);
    } else {
      clearTimeout(timeoutId);
      typingAnimation.stopAnimation();
      setDisplayedText('');
    }

    return () => clearTimeout(timeoutId);
  }, [searchQuery, quote]);

  const handleCarouselSelect = (carouselName) => {
    navigation.navigate('CarouselStack', { carouselName });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => handleCarouselSelect(item.name)}
    >
      <Text style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#333"
          value={searchQuery}
          onChangeText={setSearchQuery}
          keyboardAppearance="dark"
        />
      </View>

      {DATA.some(item => item.title.toLowerCase().includes(searchQuery.toLowerCase())) ? (
        <FlatList
          data={DATA.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        searchQuery.trim() !== '' && (
          <View style={styles.notFoundContainer}>
            <Text style={styles.notFoundText}>{displayedText}</Text>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7', // Cream background
  },
  header: {
    paddingHorizontal: 10,
    paddingVertical: 20,
    backgroundColor: '#fff6e7',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 10,
  },
  searchInput: {
    height: 50,
    backgroundColor: '#fff6e7',
    color: '#000',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  item: {
    padding: 20,
    marginVertical: 8,
    borderRadius: 15,
    backgroundColor: '#fff6e7',
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    color: '#000',
  },
  notFoundContainer: {
    flex: 1,
    marginTop:260,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
});
