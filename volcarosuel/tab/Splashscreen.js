import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions, TouchableOpacity, Modal, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const topRightScale = useRef(new Animated.Value(1)).current;
  const bottomLeftScale = useRef(new Animated.Value(1)).current;
  const topLeftScale = useRef(new Animated.Value(1)).current;
  const bottomRightScale = useRef(new Animated.Value(1)).current;

  const [typedText, setTypedText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const fullText = "A volunteer's guidebook.";
  let index = 0;

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

      const typeText = () => {
        if (index < fullText.length) {
          setTypedText((prev) => prev + fullText[index]);
          index++;
          setTimeout(typeText, 100);
        }
      };

      startAnimations();
      setTypedText(''); // Reset text
      index = 0;
      setTimeout(typeText, 1000); // Start typing after a delay

    }, [logoScale, textOpacity, topRightScale, bottomLeftScale, topLeftScale, bottomRightScale])
  );

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
        <Image source={require('../../assets/spaceship.png')} style={styles.logo} />
      </Animated.View>
      <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
        <Text style={styles.title}>NexoLink</Text>
      </Animated.View>
      <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
        <Text style={styles.typingText}>{typedText}</Text>
      </Animated.View>
      <TouchableOpacity onPress={openModal} style={styles.infoButton}>
        <Ionicons name="information-circle-outline" size={30} color="#fff6e7" />
      </TouchableOpacity>
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
              This app is a volunteer's guidebook designed to help you find volunteer opportunities in various sectors such as animal care, environment, family support, hospitals, and library in marin. Explore the different sections to find opportunities that match your interests and start making a difference today!
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    width: width * 0.2,
    height: width * 0.2,
    resizeMode: 'contain',
    tintColor: "#fff6e7"
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: '#fff6e7',
  },
  typingText: {
    fontSize: width * 0.05,
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
  infoButton: {
    position: 'absolute',
    top: height * 0.03,
    right: width * 0.05,
    zIndex: 10,
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
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  bottomSheetText: {
    fontSize: 16,
    color: 'black',
    marginBottom: 20,
  },
  closeButton: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
});

export default WelcomeScreen;
