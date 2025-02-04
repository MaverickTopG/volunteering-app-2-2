// VolunteerScreen.js
import React, { useEffect, useRef } from 'react';
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
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const VolunteerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params; // Receive the selected item from navigation

  // Use a ref to determine if the navigation is triggered manually (e.g., via back button)
  const isManualNavigation = useRef(false);

  // Reset navigation in the background when this screen loses focus (if not manual)
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      if (!isManualNavigation.current) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Carousel' }],
        });
      }
    });
    return unsubscribe;
  }, [navigation]);

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

  // Modified back button handler to set the manual navigation flag
  const handleBackPress = () => {
    isManualNavigation.current = true;
    navigation.goBack();
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

          {/* Website Section styled like the carousel navigate button */}
          {item.website && (
            <TouchableOpacity 
              onPress={handleWebsitePress} 
              style={styles.navigateButton}
              accessibilityLabel={`Visit website for ${item.title}`}
              accessibilityRole="button"
              activeOpacity={0.7} // Adds press feedback
            >
              <Text style={styles.navigateButtonText}>Visit Website</Text>
              <MaterialIcons name="open-in-new" size={20} color="#333333" />
            </TouchableOpacity>
          )}
        </View>

        {/* Back Button at the Bottom */}
        <TouchableOpacity style={styles.bottomBackButton} onPress={handleBackPress}>
          <Text style={styles.bottomBackButtonText}>Back</Text>
        </TouchableOpacity>
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
    paddingBottom: 120, // Extra bottom space so content isn’t hidden by bottom tab
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
    marginTop: 0, // Prevent overlap with any top content
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
    width: '100%',
    height: 250,
    borderRadius: 15,
    resizeMode: 'contain',
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
    color: 'black',
    marginBottom: 10,
    textDecorationLine: 'underline',
  },
  emailText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  // Website button styled to match the carousel UI
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff6e7',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  navigateButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Back button now at the bottom with extra margin
  bottomBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#fff6e7',
    marginBottom: 30, // extra bottom margin to avoid overlap with bottom tab
  },
  bottomBackButtonText: {
    fontSize: 18,
    color: '#333',
    marginLeft: 0,
    fontWeight: 'bold',
  },
});
