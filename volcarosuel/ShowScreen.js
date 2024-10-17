// VolunteerScreen.js
import React from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  Text, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  ScrollView, 
  Linking, 
  Alert 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { MaterialIcons } from '@expo/vector-icons';
import SwipeButton from './SwipeButton'; // Ensure SwipeButton is correctly implemented

const { width, height } = Dimensions.get('window');

const VolunteerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params; // Receive the selected item from navigation

  // Function to handle opening the website with improved error handling
  const handleWebsitePress = () => {
    if (item.website) {
      Linking.canOpenURL(item.website)
        .then((supported) => {
          if (supported) {
            Linking.openURL(item.website);
          } else {
            Alert.alert('Error', 'Unable to open the website.');
          }
        })
        .catch((err) => {
          console.error('Failed to open URL:', err);
          Alert.alert('Error', 'An unexpected error occurred.');
        });
    }
  };

  // Function to handle swipe action
  const handleSwipe = (isToggled) => {
    if (isToggled) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView />
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false} // Hide the scroll bar
      >
        {/* Title Section */}
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
          
          {/* Address Section */}
          <TouchableOpacity 
            onPress={() => {
              // Assuming you have a 'Map' screen set up to handle address navigation
              navigation.navigate('Map', { address: item.address });
            }}
            accessibilityLabel={`Open map for address: ${item.address}`}
            accessibilityRole="button"
          >
            <Text style={styles.addressText}>{item.address}</Text>
          </TouchableOpacity>
          
          {/* Email Section */}
          {item.email && (
            <Text style={styles.emailText}>Contact: {item.email}</Text>
          )}

          {/* Website Section */}
          {item.website && (
            <TouchableOpacity 
              onPress={handleWebsitePress} 
              style={styles.websiteButton}
              accessibilityLabel={`Visit website for ${item.title}`}
              accessibilityRole="button"
              activeOpacity={0.7} // Adds feedback when pressed
            >
              <Text style={styles.websiteText}>Visit Website</Text>
              <MaterialIcons name="open-in-new" size={20} color="black" />
            </TouchableOpacity>
          )}
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

export default VolunteerScreen;

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
    marginBottom: 15,
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff6e7',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'black', // Accent color border
  },
  websiteText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  swipeButtonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  scrollPadding: {
    height: 100,  // Extra padding to avoid collision with bottom navigation
  },
});
