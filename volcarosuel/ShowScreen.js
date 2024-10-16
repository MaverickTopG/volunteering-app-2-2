import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import SwipeButton from './SwipeButton';

const DisplayScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { item } = route.params;

  const handleSwipe = (isToggled) => {
    if (isToggled) {
      navigation.goBack();
    }
  };

  const handleAddressPress = () => {
    navigation.navigate('Map', { address: item.address });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView />
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false} // Hide the scroll bar
      >
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{item.title}</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.locationText}>{item.location}</Text>
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
        </View>

        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image source={item.poster} style={styles.image} />
        </View>

        {/* Description Section */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{item.description}</Text>
          <TouchableOpacity onPress={handleAddressPress}>
            <Text style={styles.addressText}>{item.address}</Text>
          </TouchableOpacity>
          <Text style={styles.emailText}>{item.email}</Text>
        </View>

        {/* Swipe Button */}
        <View style={styles.swipeButtonContainer}>
          <SwipeButton onToggle={handleSwipe} />
        </View>

        {/* Extra Padding to allow scrolling up a bit */}
        <View style={styles.scrollPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7', // Light cream background
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 20,  // Allow room for scrolling up
  },
  titleContainer: {
    backgroundColor: '#fff6e7',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    padding: 20,
    width: '100%',
    alignSelf: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationText: {
    fontSize: 18,
    color: '#333',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  image: {
    width: '100%',  // Make image take full width of container
    height: 250,    // Keep a consistent height
    borderRadius: 15,
    resizeMode: 'contain',  // Ensure the image covers the area
  },
  descriptionContainer: {
    backgroundColor: '#fff6e7',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    padding: 20,
    width: '100%',
    alignSelf: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  descriptionText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  addressText: {
    fontSize: 16,
    color: 'black',  // Accent color for address
    marginBottom: 10,
    textDecorationLine: 'underline',
  },
  emailText: {
    fontSize: 16,
    color: '#333',
  },
  swipeButtonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  scrollPadding: {
    height: 100,  // Extra padding to avoid collision with bottom navigation
  },
});

export default DisplayScreen;
