import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCarousel } from './CarosuelSelection';
import Ionicons from 'react-native-vector-icons/Ionicons';

const DATA = [
  { id: '1', title: 'Animal Carousel', name: 'AnimalCarousel' },
  { id: '2', title: 'Environment Carousel', name: 'TechCarousel' },
  { id: '3', title: 'Family Carousel', name: 'FamilyCarousel' },
  { id: '4', title: 'Hospital Carousel', name: 'HospitalCarousel' },
  { id: '5', title: 'Library Carousel', name: 'SeniorCarousel' },
];

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();
  const { setSelectedCarousel } = useCarousel();

  const handleCarouselSelect = (carouselName) => {
    setSelectedCarousel(carouselName);
    navigation.navigate('Home');
  };

  const filteredData = DATA.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleCarouselSelect(item.name)} style={styles.item}>
      <Text style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );

  const handleSearch = () => {
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#fff"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Ionicons name="close-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  searchInput: {
    flex: 1,
    height: 50, // Increased height
    backgroundColor: '#000',
    color: '#fff',
    borderColor: '#fff6e7',
    borderWidth: 1,
    borderRadius: 25, // Adjusted for new height
    paddingHorizontal: 20,
    fontSize: 16,
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: '#fff6e7',
    padding: 10,
    borderRadius: 25, // Adjusted for new height
  },
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: 'black',
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    color: '#fff', // Set text color to white
  },
});

export default SearchScreen;
