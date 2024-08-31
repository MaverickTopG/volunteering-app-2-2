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
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{item.title}</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.locationText}>{item.location}</Text>
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
        </View>
        <View style={styles.imageContainer}>
          <Image source={item.poster} style={styles.image} />
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{item.description}</Text>
          <TouchableOpacity onPress={handleAddressPress}>
            <Text style={styles.addressText}>{item.address}</Text>
          </TouchableOpacity>
          <Text style={styles.emailText}>{item.email}</Text>
        </View>
        <View style={styles.swipeButtonContainer}>
          <SwipeButton onToggle={handleSwipe} />
        </View>
        <View style={styles.scrollPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 10,
    paddingBottom: 100, 
  },
  titleContainer: {
    backgroundColor: '#fff6e7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'white',
    padding: 15,
    width: '100%',
    alignSelf: 'center',
    marginBottom: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  subtitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationText: {
    fontSize: 18,
    color: 'black',
  },
  dateText: {
    fontSize: 16,
    color: 'black',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: '50%',
    height: 250, // Adjust the height to fill the area
    borderRadius: 10,
    resizeMode: 'contain',
  },
  descriptionContainer: {
    backgroundColor: '#fff6e7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black',
    padding: 15,
    width: '100%',
    alignSelf: 'center',
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 18,
    color: 'black',
    marginBottom: 10,
  },
  addressText: {
    fontSize: 16,
    color: 'black',
    marginBottom: 10,
    textDecorationLine:'underline',
  },
  emailText: {
    fontSize: 16,
    color: 'black',
  },
  swipeButtonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  scrollPadding: {
    height: 10, 
  },
});

export default DisplayScreen;
