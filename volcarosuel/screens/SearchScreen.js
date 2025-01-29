import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';

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

  const handleCarouselSelect = (carouselName) => {
    navigation.navigate('CarouselStack', { carouselName }); // Navigate to the dynamic carousel stack
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
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#333333"
          keyboardAppearance="dark" 
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      <Modal
        visible={isBottomSheetVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.bottomSheet}>
          <Text style={styles.bottomSheetTitle}>Search Screen</Text>
          <Text style={styles.bottomSheetText}>
            Use the search bar to filter categories and tap on a category to navigate to the respective section.
          </Text>
          <TouchableOpacity onPress={() => setIsBottomSheetVisible(false)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
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
    backgroundColor: '#fff6e7',
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#333333',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff6e7',
    color: '#333333',
    borderColor: '#333333',
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
    borderColor: '#333333',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff6e7',
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#333333',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  bottomSheetText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 20,
  },
  closeButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: 'bold',
  },
});

export default SearchScreen;
