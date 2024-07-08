import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

const WelcomeScreen = () => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const topRightScale = useRef(new Animated.Value(1)).current;
  const bottomLeftScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const startAnimations = () => {
      logoScale.setValue(0);
      textOpacity.setValue(0);
      topRightScale.setValue(1);
      bottomLeftScale.setValue(1);

      // Animate logo and text sequentially
      Animated.sequence([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      // Looping animation for the side curves
      const loopAnimation = (animatedValue) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 1.5,
              duration: 3500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 3500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      loopAnimation(topRightScale);
      loopAnimation(bottomLeftScale);
    };

    startAnimations();
  }, [logoScale, textOpacity, topRightScale, bottomLeftScale]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
        <Text style={styles.logo}>🐾</Text>
      </Animated.View>
      <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
        <Text style={styles.title}>Animal Carousel</Text>
      </Animated.View>
      <View style={styles.curvesContainer}>
        <Animated.View style={[styles.curve, styles.topRightCurve, { transform: [{ scale: topRightScale }] }]}>
          <View style={styles.curveLayer1} />
          <View style={styles.curveLayer2} />
          <View style={styles.curveLayer3} />
        </Animated.View>
        <Animated.View style={[styles.curve, styles.bottomLeftCurve, { transform: [{ scale: bottomLeftScale }] }]}>
          <View style={styles.curveLayer1} />
          <View style={styles.curveLayer2} />
          <View style={styles.curveLayer3} />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    fontSize: 80,
    color: '#fff6e7',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff6e7',
  },
  curvesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  curve: {
    position: 'absolute',
    width: 200,
    height: 200,
  },
  topRightCurve: {
    top: 0,
    right: 0,
  },
  bottomLeftCurve: {
    bottom: 0,
    left: 0,
  },
  curveLayer1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff6e7',
    opacity: 0.7,
    borderRadius: 200,
  },
  curveLayer2: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#d9cdc4',
    opacity: 0.5,
    borderRadius: 180,
    margin: 10,
  },
  curveLayer3: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#b2a8a1',
    opacity: 0.3,
    borderRadius: 160,
    margin: 20,
  },
});

export default WelcomeScreen;
