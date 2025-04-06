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
  Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

// Use the iPhone 16 Pro Max as the design baseline.
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get('window');

const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

const GoFundMeScreen = () => {
  // Animations for logo & text opacity.
  const logoScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  // Typed text effect.
  const [typedText, setTypedText] = useState('');
  const indexRef = useRef(0);
  const fullText = 'Empowering volunteers!';

  useEffect(() => {
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

    // Typed text effect.
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
  }, [logoScale, textOpacity]);

  const goFundMeUrl =
    'https://www.gofundme.com/f/empower-volunteers-and-transform-communities-with-nexolink';

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

        {/* Title */}
        <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
          <Text style={styles.title}>NexoLink Fundraiser</Text>
        </Animated.View>

        {/* Typed Text */}
        <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
          <Text style={styles.typingText}>{typedText}</Text>
        </Animated.View>

        {/* Gradient "Donate Now" Button */}
        <TouchableOpacity
          onPress={() => Linking.openURL(goFundMeUrl)}
          activeOpacity={0.85}
          style={{ marginTop: verticalScale(20) }}
        >
          <LinearGradient
            colors={['#fff0d4', '#ffe8c9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.gradientButtonText}>Donate Now</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Info Section with Warm Gradient */}
        <LinearGradient
          colors={['#fff0d4', '#ffe8c9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.infoSection}
        >
          <Text style={styles.infoTitle}>Why We Need Your Help</Text>
          <Text style={styles.infoText}>
            We're raising funds to keep NexoLink as a nonprofit and to purchase subscriptions
            that will enhance the app’s features. Your support helps us improve volunteering
            accessibility and impact more lives.
          </Text>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GoFundMeScreen;

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
    width: scale(128),
    height: scale(128),
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  title: {
    fontSize: scale(28),
    fontWeight: 'bold',
    color: '#333',
  },
  typingText: {
    fontSize: scale(20),
    color: '#333',
    marginTop: verticalScale(5),
  },
  gradientButton: {
    borderRadius: scale(10),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(40),
    shadowColor: '#ffe8c9',
    shadowOpacity: 0.6,
    shadowRadius: scale(6),
    shadowOffset: { width: 0, height: scale(3) },
    elevation: 6,
  },
  gradientButtonText: {
    color: '#333',
    fontSize: scale(18),
    fontWeight: '700',
    textAlign: 'center',
  },
  infoSection: {
    marginTop: verticalScale(30),
    width: '100%',
    borderRadius: scale(12),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(15),
    shadowColor: '#ffe8c9',
    shadowOpacity: 0.3,
    shadowRadius: scale(6),
    shadowOffset: { width: 0, height: verticalScale(3) },
    elevation: 4,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: verticalScale(10),
    textAlign: 'center',
  },
  infoText: {
    fontSize: scale(16),
    color: '#333',
    textAlign: 'center',
    lineHeight: verticalScale(22),
  },
});
