import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  SafeAreaView,
  Image,
  ImageBackground,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Replace these with your actual asset paths:
// const spaceshipImage = require('../assets/spaceship.png');
const backgroundImage = require('../assets/bg.png');

const getResponsiveValues = () => {
  const screenRatio = width / height;
  const isVerySmallScreen = width < 405;
  const isSmallScreen = width < 410;
  const isMediumScreen = width >= 440 && width < 600;
     
  return {
    statusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : isVerySmallScreen ? 40 : isMediumScreen ? 20 : 44,
    headerImageHeight: isVerySmallScreen ? 160 : isMediumScreen ? 250 : 140,
    bottomSheetHeight: height * (isVerySmallScreen ? 0.78 : 0.77),
    backCircleSize: isVerySmallScreen ? 32 : 36,
    backIconSize: isVerySmallScreen ? 20 : 24,
    borderRadius: isVerySmallScreen ? 20 : 24,
    cardBorderRadius: isVerySmallScreen ? 14 : 16,
    horizontalPadding: isVerySmallScreen ? 12 : 16,
    verticalPadding: isVerySmallScreen ? 16 : 20,
    marginBottom: isVerySmallScreen ? 12 : 16,
    scrollMarginTop: isVerySmallScreen ? 0 : 0,
    paddingBottom: isVerySmallScreen ? 40 : 60,
    handleBarWidth: isVerySmallScreen ? 35 : 40,
  };
};

/**
 * FloatingParticle:
 * A small white circle that drifts around ever so slightly.
 */
const FloatingParticle = ({ delay, duration, size }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(0.1)).current;

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: -20,
              duration: duration / 4,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 10,
              duration: duration / 4,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.5,
              duration: duration / 4,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: -10,
              duration: duration / 4,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: -15,
              duration: duration / 4,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.2,
              duration: duration / 4,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: -25,
              duration: duration / 4,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 5,
              duration: duration / 4,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.4,
              duration: duration / 4,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 0,
              duration: duration / 4,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 0,
              duration: duration / 4,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.1,
              duration: duration / 4,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    const timer = setTimeout(animate, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          transform: [{ translateX }, { translateY }],
          opacity,
        },
      ]}
    />
  );
};

const NexolinkLoginScreen = ({ navigation }) => {
  const buttonScale = useRef(new Animated.Value(1)).current;
  const responsive = getResponsiveValues();

  const handleButtonPress = (callback) => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (callback) callback();
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleSignup = () => {
    navigation.navigate('Register');
  };

  // Generate data for 25 drifting particles
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 3,
    delay: Math.random() * 8000,
    duration: Math.random() * 4000 + 6000,
    left: Math.random() * width,
    top: Math.random() * height * 0.7,
  }));

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.backgroundImage}
      imageStyle={{ resizeMode: 'cover' }}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" />

        {/* Floating white particles */}
        <View style={styles.particlesContainer}>
          {particles.map((p) => (
            <View
              key={p.id}
              style={[
                styles.particleWrapper,
                { left: p.left, top: p.top },
              ]}
            >
              <FloatingParticle
                delay={p.delay}
                duration={p.duration}
                size={p.size}
              />
            </View>
          ))}
        </View>

        {/* Logo & Title (shifted up by 15% of screen height) */}
        <View style={[styles.logoSection, { 
          marginTop: -(height * 0.15),
          paddingHorizontal: responsive.horizontalPadding,
          paddingTop: responsive.verticalPadding,
        }]}>
          {/* <Image
            source={spaceshipImage}
            style={[styles.logoImage, { tintColor: '#FFF' }]}
            resizeMode="contain"
          /> */}
          <Text style={[styles.appTitle, {
            fontSize: width < 405 ? 35 : width >= 440 && width < 600 ? 46 : 42,
          }]}>Track Volunteer Hours</Text>
        </View>

        {/* Bottom section */}
        <View style={[styles.bottomSection, {
          paddingHorizontal: responsive.horizontalPadding * 2,
          paddingBottom: responsive.paddingBottom,
          bottom: -(height * 0.03), // Move buttons down 15%
        }]}>
          <TouchableOpacity onPress={handleSignup} activeOpacity={0.8}>
            <Text style={[styles.headerButtonText, {
              fontSize: width < 405 ? 18 : 20,
              marginBottom: responsive.marginBottom * 2.5,
            }]}>SIGNUP</Text>
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.button, styles.loginButton, {
                borderRadius: responsive.borderRadius + 4,
                height: width < 405 ? 50 : 56,
                marginBottom: width < 405 ? 110 : width >= 440 && width < 600 ? 100 : 90,
              }]}
              onPress={() => handleButtonPress(handleLogin)}
              activeOpacity={0.8}
            >
              <Text style={[styles.loginButtonText, {
                fontSize: width < 405 ? 15 : 18,
              }]}>LOGIN</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  // This ImageBackground wraps the entire screen, allowing no overflow restrictions
  backgroundImage: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: 'transparent', // let the background image show through
  },

  // Particles container covers entire screen
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particleWrapper: {
    position: 'absolute',
  },
  particle: {
    backgroundColor: '#FFF',
    borderRadius: 50,
  },

  // Logo & App Title
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
    // The tintColor '#FFF' in the component will turn this white
  },
  appTitle: {
    fontWeight: '700',
    color: '#FFF',        // White text
    letterSpacing: 2,
    textAlign: 'center',
  },

  // Bottom Section
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent', // allow background image behind
    paddingTop: 20,
    alignItems: 'center',
  },
  headerButtonText: {
    color: '#FFF',       // White "SIGNUP" text
    fontWeight: '600',
  },

  // White button with black text
  button: {
    width: width,
    maxWidth: 300,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loginButton: {
    backgroundColor: '#FFF',  // White background
  },
  loginButtonText: {
    fontWeight: '600',
    color: '#000',           // Black text inside button
    letterSpacing: 1,
  },
});

export default NexolinkLoginScreen;