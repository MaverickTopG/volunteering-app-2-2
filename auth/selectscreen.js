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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Replace these with your actual asset paths:
// const spaceshipImage = require('../assets/spaceship.png');
const backgroundImage = require('../assets/bg.png');

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
        <View style={[styles.logoSection, { marginTop: -(height * 0.15) }]}>
          {/* <Image
            source={spaceshipImage}
            style={[styles.logoImage, { tintColor: '#FFF' }]}
            resizeMode="contain"
          /> */}
          <Text style={styles.appTitle}>Track Volunteer Hours</Text>
        </View>

        {/* Bottom section */}
        <View style={styles.bottomSection}>
          <TouchableOpacity onPress={handleSignup} activeOpacity={0.8}>
            <Text style={styles.headerButtonText}>SIGNUP</Text>
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.button, styles.loginButton]}
              onPress={() => handleButtonPress(handleLogin)}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>LOGIN</Text>
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
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
    // The tintColor '#FFF' in the component will turn this white
  },
  appTitle: {
    fontSize: 48,
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
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 20,
    color: '#FFF',       // White “SIGNUP” text
    fontWeight: '600',
    marginBottom: 40,
  },

  // White button with black text
  button: {
    width: width - 60,
    maxWidth: 300,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loginButton: {
    backgroundColor: '#FFF',  // White background
    marginBottom: 90,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',           // Black text inside button
    letterSpacing: 1,
  },
});

export default NexolinkLoginScreen;
