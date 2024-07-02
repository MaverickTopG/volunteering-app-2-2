import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCarousel } from './CarosuelSelection';

const DATA = [
  { id: '1', title: 'Animal Carousel', name: 'AnimalCarousel' },
  { id: '2', title: 'Tech Carousel', name: 'TechCarousel' },
  { id: '3', title: 'Family Carousel', name: 'FamilyCarousel' },
  { id: '4', title: 'Hospital Carousel', name: 'HospitalCarousel' },
  { id: '5', title: 'Senior Carousel', name: 'SeniorCarousel' },
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

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
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
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 20,
    margin: 10,
    fontSize: 16,
  },
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 18,
  },
});

export default SearchScreen;
