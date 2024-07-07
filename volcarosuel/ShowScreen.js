import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import SwipeButton from './SwipeButton';
import { useNavigation } from '@react-navigation/native';

const DetailScreen = () => {
  const navigation = useNavigation();

  const handleSwipe = (isToggled) => {
    if (isToggled) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>AFRO VIBES</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.locationText}>Mumbai, India</Text>
            <Text style={styles.dateText}>Nov 17th, 2020</Text>
          </View>
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>An exciting Afro vibes event.</Text>
        </View>
        <View style={styles.addressContainer}>
          <Text style={styles.addressText}>120 lower via casitas</Text>
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
  swipeButtonContainer: {
    alignItems: 'center',
  },
});

export default DetailScreen;
