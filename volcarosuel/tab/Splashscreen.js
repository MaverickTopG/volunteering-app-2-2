import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const topRightScale = useRef(new Animated.Value(1)).current;
  const bottomLeftScale = useRef(new Animated.Value(1)).current;
  const topLeftScale = useRef(new Animated.Value(1)).current;
  const bottomRightScale = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    React.useCallback(() => {
      const startAnimations = () => {
        logoScale.setValue(0);
        textOpacity.setValue(0);
        topRightScale.setValue(1);
        bottomLeftScale.setValue(1);
        topLeftScale.setValue(1);
        bottomRightScale.setValue(1);

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
        loopAnimation(topLeftScale);
        loopAnimation(bottomRightScale);
      };

      startAnimations();
    }, [logoScale, textOpacity, topRightScale, bottomLeftScale, topLeftScale, bottomRightScale])
  );

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
        <Animated.View style={[styles.curve, styles.topLeftCurve, { transform: [{ scale: topLeftScale }] }]}>
          <View style={styles.smallCurveLayer1} />
          <View style={styles.smallCurveLayer2} />
          <View style={styles.smallCurveLayer3} />
        </Animated.View>
        <Animated.View style={[styles.curve, styles.bottomRightCurve, { transform: [{ scale: bottomRightScale }] }]}>
          <View style={styles.smallCurveLayer1} />
          <View style={styles.smallCurveLayer2} />
          <View style={styles.smallCurveLayer3} />
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
    marginBottom: height * 0.05,
  },
  logo: {
    fontSize: width * 0.2,
    color: '#fff6e7',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: height * 0.1,
  },
  title: {
    fontSize: width * 0.07,
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
    width: width * 0.5,
    height: width * 0.5,
  },
  topRightCurve: {
    top: -width * 0.1,
    right: -width * 0.1,
  },
  bottomLeftCurve: {
    bottom: -width * 0.1,
    left: -width * 0.1,
  },
  topLeftCurve: {
    top: height * 0.1,
    left: width * 0.1,
    width: width * 0.3,
    height: width * 0.3,
  },
  bottomRightCurve: {
    bottom: height * 0.1,
    right: width * 0.1,
    width: width * 0.3,
    height: width * 0.3,
  },
  curveLayer1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff6e7',
    opacity: 0.7,
    borderRadius: width * 0.5,
  },
  curveLayer2: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#d9cdc4',
    opacity: 0.5,
    borderRadius: width * 0.45,
    margin: width * 0.025,
  },
  curveLayer3: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#b2a8a1',
    opacity: 0.3,
    borderRadius: width * 0.4,
    margin: width * 0.05,
  },
  smallCurveLayer1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff6e7',
    opacity: 0.7,
    borderRadius: width * 0.3,
  },
  smallCurveLayer2: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#d9cdc4',
    opacity: 0.5,
    borderRadius: width * 0.27,
    margin: width * 0.015,
  },
  smallCurveLayer3: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#b2a8a1',
    opacity: 0.3,
    borderRadius: width * 0.24,
    margin: width * 0.03,
  },
});

export default WelcomeScreen;
