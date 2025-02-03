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
  ScrollView, 
  Linking 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const GoFundMeScreen = () => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  const [typedText, setTypedText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const indexRef = useRef(0);

  const fullText = "Empowering volunteers!";

  useFocusEffect(
    React.useCallback(() => {
      const startAnimations = () => {
        logoScale.setValue(0);
        textOpacity.setValue(0);

        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }).start();

        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          delay: 500,
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
      setTypedText('');
      indexRef.current = 0;
      setTimeout(typeText, 1000);
    }, [logoScale, textOpacity])
  );

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const goFundMeUrl = 'https://www.gofundme.com/f/empower-volunteers-and-transform-communities-with-nexolink/cl/o?lang=en_US&utm_campaign=man_sharesheet_dash&utm_medium=customer&utm_source=copy_link&attribution_id=sl%3A48e2683e-cde6-4354-a729-ac076c7c4394'; // Replace with your actual GoFundMe link

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
        showsVerticalScrollIndicator={false}
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
          <Text style={styles.title}>NexoLink Fundraiser</Text>
        </Animated.View>

        {/* Typed Text */}
        <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
          <Text style={styles.typingText}>{typedText}</Text>
        </Animated.View>

        {/* Donate Now Button */}
        <TouchableOpacity 
          style={styles.donateButton} 
          onPress={() => Linking.openURL(goFundMeUrl)}
        >
          <Text style={styles.donateButtonText}>Donate Now</Text>
        </TouchableOpacity>
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
            <Text style={styles.bottomSheetTitle}>Why We Need Your Help</Text>
            <Text style={styles.bottomSheetText}>
              We're raising funds to keep NexoLink as a nonprofit and to purchase subscriptions that will enhance the app’s features.
              Your support helps us improve volunteering accessibility and impact more lives.
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

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7', 
    position: 'relative',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: height * 0.05,
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    resizeMode: 'contain',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: '#333',
  },
  typingText: {
    fontSize: width * 0.05,
    color: '#333',
    marginTop: 5,
  },
  infoButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  donateButton: {
    marginTop: 20,
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3, // For Android shadow
  },
  donateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: '#fff6e7',
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: height * 0.5,
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
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default GoFundMeScreen;
