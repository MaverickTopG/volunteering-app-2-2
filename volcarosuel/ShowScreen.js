import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import SwipeButton from './SwipeButton';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const ShowScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params; // Retrieve the item data passed via navigation

  const handleSwipe = (isToggled) => {
    if (isToggled) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{item.title}</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.locationText}>{item.location}</Text>
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{item.description}</Text>
        </View>
        <View style={styles.addressContainer}>
          <Text style={styles.addressText}>{item.address}</Text>
        </View>
        <View style={styles.emailContainer}>
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
    backgroundColor: '#000',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 10,
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
  },
  addressContainer: {
    backgroundColor: '#fff6e7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black',
    padding: 15,
    width: '100%',
    alignSelf: 'center',
    marginBottom: 20,
  },
  addressText: {
    fontSize: 18,
    color: 'black',
  },
  emailContainer: {
    backgroundColor: '#fff6e7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black',
    padding: 15,
    width: '100%',
    alignSelf: 'center',
    marginBottom: 20,
  },
  emailText: {
    fontSize: 18,
    color: 'black',
  },
  swipeButtonContainer: {
    alignItems: 'center',
  },
  swipeButton: {
    width: width * 0.9,
    height: height * 0.1,
    borderRadius: (height * 0.1) / 2,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ShowScreen;
