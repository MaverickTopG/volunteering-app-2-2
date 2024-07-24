import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions, Image } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';

const { width, height } = Dimensions.get('window');

const CustomSideBarMenu = (props) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const positionX = useRef(new Animated.Value(width / 2)).current;
  const positionY = useRef(new Animated.Value(height / 2)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.bounce,
      useNativeDriver: true,
    }).start();

    startSpaceshipAnimation();
  }, []);

  const startSpaceshipAnimation = () => {
    if (!isAnimating) return;

    const moveSpaceship = () => {
      if (!isAnimating) return;

      const newX = Math.random() * (width - 100);
      const newY = Math.random() * (height - 300) + 200;

      const angle = Math.atan2(newY - positionY._value, newX - positionX._value) * (180 / Math.PI);

      Animated.parallel([
        Animated.timing(positionX, {
          toValue: newX,
          duration: 25000, // Move for 25 seconds
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(positionY, {
          toValue: newY,
          duration: 25000, // Move for 25 seconds
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: angle,
          duration: 12500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (!isAnimating) return;

        // Final 5 seconds animation to disappear
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 5000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (!isAnimating) return;

          // Restart animation in reverse after it exits the screen
          positionY.setValue(Math.random() * (height - 300) + 200);
          positionX.setValue(Math.random() * (width - 100));
          rotation.setValue(Math.random() * 360);
          opacity.setValue(1);
          moveSpaceship();
        });
      });
    };

    moveSpaceship();
  };

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('drawerOpen', () => {
      setIsAnimating(true);
      startSpaceshipAnimation();
    });

    const unsubscribeClose = props.navigation.addListener('drawerClose', () => {
      setIsAnimating(false);
    });

    return () => {
      unsubscribe();
      unsubscribeClose();
    };
  }, [props.navigation]);

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props}>
        <View style={styles.header}>
          <Animated.View style={[styles.boxContainer, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.box}>
              <Text style={styles.boxText}>NexoLink</Text>
            </View>
          </Animated.View>
        </View>
        <DrawerItem
          label="Animal Carousel"
          labelStyle={styles.drawerItemLabel}
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('Animal Carousel')}
        />
        {/* Add other DrawerItem components as needed */}
      </DrawerContentScrollView>
      {isAnimating && (
        <Animated.View style={[styles.spaceshipContainer, {
          transform: [
            { translateX: positionX },
            { translateY: positionY },
            { rotate: rotation.interpolate({
                inputRange: [-180, 180],
                outputRange: ['-180deg', '180deg']
            }) }
          ],
          opacity: opacity
        }]}>
          <View style={styles.trail}>
            <View style={styles.dotLarge} />
            <View style={styles.dotSmall} />
          </View>
          <Image source={require('../assets/spaceship.png')} style={styles.spaceship} />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  boxContainer: {
    backgroundColor: '#fff6e7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  box: {
    backgroundColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  boxText: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: '#fff6e7',
  },
  drawerItem: {
    backgroundColor: 'black',
    marginVertical: 5,
    borderRadius: 10,
  },
  drawerItemLabel: {
    color: '#fff6e7',
    fontSize: RFValue(16),
    paddingHorizontal: 20,
  },
  spaceshipContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  trail: {
    position: 'absolute',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: -20, // Adjust based on spaceship size
  },
  dotLarge: {
    width: 10,
    height: 10,
    backgroundColor: 'black',
    borderRadius: 5,
    marginBottom: 5,
  },
  dotSmall: {
    width: 5,
    height: 5,
    backgroundColor: 'black',
    borderRadius: 2.5,
  },
  spaceship: {
    width: 40,
    height: 40,
  },
});

export default CustomSideBarMenu;
