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
  Alert, 
  Animated 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Create an Animated version of TouchableOpacity
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// A reusable animated button component that scales on press
const AnimatedButton = ({ onPress, style, children, ...props }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <AnimatedTouchable
      activeOpacity={0.8}
      {...props}
      onPress={onPress}
      onPressIn={() => {
        Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
      }}
      onPressOut={() => {
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
      }}
      style={[style, { transform: [{ scale: scaleAnim }] }]}
    >
      {children}
    </AnimatedTouchable>
  );
};

const VolunteerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params; // Receive the selected item from navigation

  // Ref to determine if the navigation is triggered manually (e.g., via back button)
  const isManualNavigation = useRef(false);
  
  // Animated value for image fade in
  const imageFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in the image container when mounted
    if (item.poster) {
      Animated.timing(imageFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [item.poster, imageFadeAnim]);

  // Reset navigation when this screen loses focus (if not manual)
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

  // Handle opening the website
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
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{item.title}</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.locationText}>{item.location}</Text>
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
        </View>

        {/* Image Section with fade in */}
        {item.poster && (
          <Animated.View style={[styles.imageContainer, { opacity: imageFadeAnim }]}>
            <Image source={item.poster} style={styles.image} />
          </Animated.View>
        )}

        {/* Description Section */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{item.description}</Text>
          
          {/* Address Section */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('Map', { address: item.address })}
            accessibilityLabel={`Open map for address: ${item.address}`}
            accessibilityRole="button"
          >
            <Text style={styles.addressText}>{item.address}</Text>
          </TouchableOpacity>
          
          {/* Email Section */}
          {item.email && (
            <Text style={styles.emailText}>Contact: {item.email}</Text>
          )}

          {/* Website Section using a gradient button */}
          {item.website && (
            <AnimatedButton 
              onPress={handleWebsitePress} 
              style={styles.navigateButton}
              accessibilityLabel={`Visit website for ${item.title}`}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={['#8b6f57', '#a8896c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              >
                <Text style={styles.navigateButtonText}>Visit Website</Text>
                <MaterialIcons name="open-in-new" size={20} color="#fff" />
              </LinearGradient>
            </AnimatedButton>
          )}
        </View>

        {/* Back Button at the Bottom */}
        <AnimatedButton style={styles.bottomBackButton} onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.bottomBackButtonText}>Back</Text>
        </AnimatedButton>
      </ScrollView>
    </View>
  );
};

export default VolunteerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  titleContainer: {
    backgroundColor: '#fdf2e9',
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1c699',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  titleText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#5a3e2b',
    marginBottom: 8,
  },
  subtitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationText: {
    fontSize: 18,
    color: '#8b6f57',
  },
  dateText: {
    fontSize: 16,
    color: '#8b6f57',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  descriptionContainer: {
    backgroundColor: '#fdf2e9',
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1c699',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  descriptionText: {
    fontSize: 18,
    color: '#5a3e2b',
    lineHeight: 26,
    marginBottom: 15,
  },
  addressText: {
    fontSize: 16,
    color: '#5a3e2b',
    textDecorationLine: 'underline',
    marginBottom: 12,
  },
  emailText: {
    fontSize: 16,
    color: '#5a3e2b',
    marginBottom: 15,
  },
  navigateButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 10,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  navigateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  bottomBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b6f57',
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  bottomBackButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});
