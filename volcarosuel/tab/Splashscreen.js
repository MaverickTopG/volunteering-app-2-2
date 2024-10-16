import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Easing, 
  Dimensions, 
  TouchableOpacity, 
  Modal, 
  Image, 
  SafeAreaView, 
  ScrollView 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  // Animation refs
  const logoScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  // State for typed text and modal visibility
  const [typedText, setTypedText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const indexRef = useRef(0); // Use ref for index

  const fullText = "A volunteer's guidebook.";

  useFocusEffect(
    React.useCallback(() => {
      const startAnimations = () => {
        // Reset animation values
        logoScale.setValue(0);
        textOpacity.setValue(0);

        // Animate logo scaling
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }).start();

        // Animate text opacity after logo animation
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          delay: 500, // Delay to start after logo animation
          useNativeDriver: true,
        }).start();
      };

      const typeText = () => {
        if (indexRef.current < fullText.length) {
          setTypedText((prev) => prev + fullText[indexRef.current]);
          indexRef.current++;
          setTimeout(typeText, 100);
        }
      };

      startAnimations();
      setTypedText(''); // Reset text
      indexRef.current = 0;
      setTimeout(typeText, 1000); // Start typing after a delay

    }, [logoScale, textOpacity])
  );

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Info Button */}
      <TouchableOpacity 
        onPress={openModal} 
        style={styles.infoButton} 
        accessibilityLabel="Open information modal"
        accessibilityRole="button"
      >
        <Ionicons name="information-circle-outline" size={30} color="#333" />
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false} // Hide the scroll bar
      >
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
          <Image 
            source={require('../../assets/spaceship.png')} // Ensure the path is correct
            style={styles.logo} 
            resizeMode="contain" 
          />
        </Animated.View>

        {/* App Name */}
        <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
          <Text style={styles.title}>NexoLink</Text>
        </Animated.View>

        {/* Typed Text */}
        <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
          <Text style={styles.typingText}>{typedText}</Text>
        </Animated.View>
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.bottomSheet}>
            <Text style={styles.bottomSheetTitle}>About This App</Text>
            <Text style={styles.bottomSheetText}>
              This app is a volunteer's guidebook designed to help you find volunteer opportunities in various sectors such as animal care, environment, family support, hospitals, and library in Marin. Explore the different sections to find opportunities that match your interests and start making a difference today!
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Styles adjusted to match the app's UI
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7', // Light cream background to match the app's theme
    position: 'relative', // Ensure absolute positioning is relative to this container
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically
  },
  logoContainer: {
    marginBottom: height * 0.05,
  },
  logo: {
    width: width * 0.3, // Adjusted size for better visibility
    height: width * 0.3,
    resizeMode: 'contain',
    // Remove tintColor to display original logo colors
    // If you need to tint the logo, ensure it aligns with the app's color scheme
    // tintColor: "#333",
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  title: {
    fontSize: width * 0.07, // Responsive font size
    fontWeight: 'bold',
    color: '#333', // Dark color for better contrast
  },
  typingText: {
    fontSize: width * 0.05,
    color: '#333',
    marginTop: 5,
  },
  infoButton: {
    position: 'absolute',
    top: 20, // Adjust based on your SafeArea
    right: 20,
    zIndex: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  bottomSheet: {
    backgroundColor: '#fff6e7',
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: height * 0.5, // Limit height for better usability
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  bottomSheetText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  closeButton: {
    fontSize: 16,
    color: 'black', // Accent color for the close button
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;
