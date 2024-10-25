import React from 'react';
import { View, StyleSheet, Text, SafeAreaView } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

const VolunteerScreen = () => {
  const rMiniBarStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(-20) }],
    backgroundColor: '#fff6e7',
  }));

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, rMiniBarStyle]}>
        <Text style={styles.headerText}>Hospital</Text>
      </Animated.View>
      <View style={styles.comingSoonContainer}>
        <Text style={styles.comingSoonText}>Coming Soon!</Text>
      </View>
    </SafeAreaView>
  );
};

export default VolunteerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7',
  },
  header: {
    height: 120,
    backgroundColor: '#fff6e7',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    shadowColor: '#333333',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  headerText: {
    fontSize: RFPercentage(3),
    fontWeight: 'bold',
    color: '#333333',
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: RFPercentage(4),
    fontWeight: 'bold',
    color: '#333333',
  },
});
