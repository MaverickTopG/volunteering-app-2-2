import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BUTTON_WIDTH = SCREEN_WIDTH * 0.9;
const BUTTON_HEIGHT = SCREEN_HEIGHT * 0.08;
const BUTTON_PADDING = 10;
const SWIPEABLE_DIMENSIONS = BUTTON_HEIGHT - 2 * BUTTON_PADDING;

const H_WAVE_RANGE = SWIPEABLE_DIMENSIONS + 2 * BUTTON_PADDING;
const H_SWIPE_RANGE = BUTTON_WIDTH - 2 * BUTTON_PADDING - SWIPEABLE_DIMENSIONS;

const SwipeButton = ({ onToggle }) => {
  const X = useSharedValue(0);

  const animatedGestureHandler = useAnimatedGestureHandler({
    onActive: (event, context) => {
      let newValue = event.translationX;
      if (newValue >= 0 && newValue <= H_SWIPE_RANGE) {
        X.value = newValue;
      }
    },
    onEnd: () => {
      if (X.value < BUTTON_WIDTH / 2 - SWIPEABLE_DIMENSIONS / 2) {
        X.value = withSpring(0);
        runOnJS(onToggle)(false);
      } else {
        X.value = withSpring(H_SWIPE_RANGE);
        runOnJS(onToggle)(true);
      }
    },
  });

  const animatedStyles = {
    swipeCont: useAnimatedStyle(() => ({})),
    colorWave: useAnimatedStyle(() => ({
      width: H_WAVE_RANGE + X.value,
      opacity: interpolate(X.value, [0, H_SWIPE_RANGE], [0, 1]),
      backgroundColor: '#000',
    })),
    swipeable: useAnimatedStyle(() => ({
      backgroundColor: '#000',
      transform: [{ translateX: X.value }],
    })),
    swipeText: useAnimatedStyle(() => ({
      opacity: interpolate(X.value, [0, H_SWIPE_RANGE], [0.7, 0], Extrapolate.CLAMP),
      transform: [
        {
          translateX: interpolate(
            X.value,
            [0, H_SWIPE_RANGE],
            [0, BUTTON_WIDTH / 2 - SWIPEABLE_DIMENSIONS],
            Extrapolate.CLAMP,
          ),
        },
      ],
    })),
  };

  return (
    <Animated.View style={[styles.swipeCont, animatedStyles.swipeCont]}>
      <Animated.View style={[animatedStyles.colorWave, styles.colorWave]} />
      <PanGestureHandler onGestureEvent={animatedGestureHandler}>
        <Animated.View style={[styles.swipeable, animatedStyles.swipeable]} />
      </PanGestureHandler>
      <Animated.Text style={[styles.swipeText, animatedStyles.swipeText]}>
        Swipe to go back
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  swipeCont: {
    height: BUTTON_HEIGHT,
    width: BUTTON_WIDTH,
    backgroundColor: '#fff6e7',
    borderRadius: BUTTON_HEIGHT,
    padding: BUTTON_PADDING,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderColor: '#fff6e7', 
    borderWidth: 0, 
  },
  colorWave: {
    position: 'absolute',
    left: 0,
    height: BUTTON_HEIGHT,
    borderRadius: BUTTON_HEIGHT,
    backgroundColor: '#000', 
  },
  swipeable: {
    position: 'absolute',
    left: BUTTON_PADDING,
    height: SWIPEABLE_DIMENSIONS,
    width: SWIPEABLE_DIMENSIONS,
    borderRadius: SWIPEABLE_DIMENSIONS,
    zIndex: 3,
    backgroundColor: '#000', 
  },
  swipeText: {
    alignSelf: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    zIndex: 2,
    color: 'black', 
  },
});

export default SwipeButton;
