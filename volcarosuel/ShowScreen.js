import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
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
          <Image source={{ uri: item.poster }} style={styles.image} />
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{item.description}</Text>
          <Text style={styles.addressText}>{item.address}</Text>
          <Text style={styles.emailText}>{item.email}</Text>
        </View>
        <View style={styles.swipeButtonContainer}>
          <SwipeButton onToggle={handleSwipe} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 10,
    paddingBottom: 100, // Ensure space for bottom tab navigation
    backgroundColor:'black'
  },
  titleContainer: {
    backgroundColor: '#fff6e7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff6e7',
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
    width: '100%',
    height: 200,
    borderRadius: 10,
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
  },
  emailText: {
    fontSize: 16,
    color: 'black',
  },
  swipeButtonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
});

export default DisplayScreen;
