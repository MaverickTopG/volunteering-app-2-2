import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCarousel } from './CarosuelSelection';
import Ionicons from 'react-native-vector-icons/Ionicons';

const DATA = [
  { id: '1', title: 'Animal', name: 'AnimalCarousel' },
  { id: '2', title: 'Environment', name: 'TechCarousel' },
  { id: '3', title: 'Family', name: 'FamilyCarousel' },
  { id: '4', title: 'Hospital', name: 'HospitalCarousel' },
  { id: '5', title: 'Library', name: 'SeniorCarousel' },
];

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
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
        <TouchableOpacity onPress={() => setIsBottomSheetVisible(true)} style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
      <Modal
        visible={isBottomSheetVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.bottomSheet}>
          <Text style={styles.bottomSheetTitle}>Search Screen</Text>
          <Text style={styles.bottomSheetText}>This screen allows you to search and select various sections based on the categories. Use the search bar to filter the categories and tap on a category to navigate to the respective section.</Text>
          <TouchableOpacity onPress={() => setIsBottomSheetVisible(false)}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    height: 50,
    backgroundColor: '#000',
    color: '#fff',
    borderColor: '#fff6e7',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: '#fff6e7',
    padding: 10,
    borderRadius: 25,
  },
  infoButton: {
    marginLeft: 10,
    backgroundColor: 'transparent',
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
    color: '#fff',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'black',
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff6e7',
    marginBottom: 10,
  },
  bottomSheetText: {
    fontSize: 16,
    color: '#fff6e7',
    marginBottom: 20,
  },
  closeButton: {
    fontSize: 16,
    color: '#fff6e7',
    textAlign: 'center',
  },
});

export default SearchScreen;
