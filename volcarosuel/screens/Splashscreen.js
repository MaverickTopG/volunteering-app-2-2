import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Dimensions, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  ScrollView, 
  Linking 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Use the iPhone 16 Pro Max as the design baseline.
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;

const { width, height } = Dimensions.get('window');

const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

const GoFundMeScreen = () => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  const [typedText, setTypedText] = useState('');
  const indexRef = useRef(0);
  const fullText = "Empowering volunteers!";

  useEffect(() => {
    // Start animations on mount.
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

    setTypedText('');
    indexRef.current = 0;
    const typeTimeout = setTimeout(() => {
      const typeText = () => {
        if (indexRef.current < fullText.length) {
          setTypedText((prev) => prev + fullText[indexRef.current]);
          indexRef.current++;
          setTimeout(typeText, 100);
        }
      };
      typeText();
    }, 1000);

    return () => clearTimeout(typeTimeout);
  }, [logoScale, textOpacity, fullText]);

  const goFundMeUrl = 'https://www.gofundme.com/f/empower-volunteers-and-transform-communities-with-nexolink/cl/o?lang=en_US&utm_campaign=man_sharesheet_dash&utm_medium=customer&utm_source=copy_link&attribution_id=sl%3A48e2683e-cde6-4354-a729-ac076c7c4394';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
          <Image 
            source={require('../../assets/spaceship.png')}
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

        {/* Info Section (Previously in Modal) */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Why We Need Your Help</Text>
          <Text style={styles.infoText}>
            We're raising funds to keep NexoLink as a nonprofit and to purchase subscriptions 
            that will enhance the app’s features. Your support helps us improve volunteering 
            accessibility and impact more lives.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7', 
  },
  contentContainer: {
    flexGrow: 1,
    padding: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: verticalScale(20),
  },
  logo: {
    width: scale(128),  // originally width * 0.3 on iPhone 16 Pro Max (~128px if guideline is 428)
    height: scale(128),
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  title: {
    fontSize: scale(30),  // adjust from width * 0.07
    fontWeight: 'bold',
    color: '#333',
  },
  typingText: {
    fontSize: scale(22),  // adjust from width * 0.05
    color: '#333',
    marginTop: verticalScale(5),
  },
  donateButton: {
    marginTop: verticalScale(20),
    backgroundColor: 'black',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(25),
    borderRadius: scale(8),
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: scale(5),
    shadowOffset: { width: 0, height: scale(3) },
    elevation: 3,
  },
  donateButtonText: {
    color: '#fff',
    fontSize: scale(18),
    fontWeight: 'bold',
  },
  infoSection: {
    marginTop: verticalScale(30),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(15),
    backgroundColor: '#fff6e7',
    borderRadius: scale(12),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    shadowOffset: { width: 0, height: verticalScale(2) },
    elevation: 2,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: verticalScale(10),
  },
  infoText: {
    fontSize: scale(16),
    color: '#333',
    textAlign: 'center',
  },
});

export default GoFundMeScreen;
