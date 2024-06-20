import { Entypo, Feather, EvilIcons } from '@expo/vector-icons';
import faker from 'faker';
import * as React from 'react';
import { Dimensions, FlatList, Text, TouchableOpacity, View, Image, StatusBar, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { MotiView } from 'moti';
import { GestureHandlerRootView, FlingGestureHandler, Directions, State } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('screen');

faker.seed(10);

const DATA = {
  animals: [
    {
      title: 'Afro vibes',
      location: 'Mumbai, India',
      date: 'Nov 17th, 2020',
      poster: 'https://www.creative-flyers.com/wp-content/uploads/2020/07/Afro-vibes-flyer-template.jpg',
    },
    {
      title: 'Jungle Party',
      location: 'Unknown',
      date: 'Sept 3rd, 2020',
      poster: 'https://www.creative-flyers.com/wp-content/uploads/2019/11/Jungle-Party-Flyer-Template-1.jpg',
    },
    // Add more items here
  ],
  // Add more categories here
  tech: [
    {
      title: 'Tech Conference',
      location: 'San Francisco, USA',
      date: 'Dec 20th, 2020',
      poster: 'https://www.creative-flyers.com/wp-content/uploads/2020/07/Tech-Conference.jpg',
    },
    {
      title: 'AI Summit',
      location: 'New York, USA',
      date: 'Jan 15th, 2021',
      poster: 'https://www.creative-flyers.com/wp-content/uploads/2020/07/AI-Summit.jpg',
    },
    // Add more items here
  ],
  children: [
    {
      title: 'Children Carnival',
      location: 'Mumbai, India',
      date: 'Nov 17th, 2020',
      poster: 'https://www.creative-flyers.com/wp-content/uploads/2020/07/Children-Carnival.jpg',
    },
    {
      title: 'Kids Party',
      location: 'Unknown',
      date: 'Sept 3rd, 2020',
      poster: 'https://www.creative-flyers.com/wp-content/uploads/2019/11/Kids-Party.jpg',
    },
    // Add more items here
  ],
  seniors: [
    {
      title: 'Senior Meetup',
      location: 'Delhi, India',
      date: 'Dec 10th, 2020',
      poster: 'https://www.creative-flyers.com/wp-content/uploads/2020/07/Senior-Meetup.jpg',
    },
    {
      title: 'Old Age Home Visit',
      location: 'Unknown',
      date: 'Sept 3rd, 2020',
      poster: 'https://www.creative-flyers.com/wp-content/uploads/2019/11/Old-Age-Home-Visit.jpg',
    },
    // Add more items here
  ],
  hospital: [
    {
      title: 'Medical Camp',
      location: 'Delhi, India',
      date: 'Dec 10th, 2020',
      poster: 'https://www.creative-flyers.com/wp-content/uploads/2020/07/Medical-Camp.jpg',
    },
    {
      title: 'Health Checkup',
      location: 'Unknown',
      date: 'Sept 3rd, 2020',
      poster: 'https://www.creative-flyers.com/wp-content/uploads/2019/11/Health-Checkup.jpg',
    },
    // Add more items here
  ],
};

const OVERFLOW_HEIGHT = 70;
const SPACING = 10;
const ITEM_WIDTH = width * 0.76;
const ITEM_HEIGHT = ITEM_WIDTH * 1.7;
const VISIBLE_ITEMS = 3;
const _spacing = 10;
const _colors = {
  active: `#FCD259ff`,
  inactive: `#FCD25900`,
};

const OverflowItems = ({ data, scrollXAnimated }) => {
  const inputRange = [-1, 0, 1];
  const translateY = scrollXAnimated.interpolate({
    inputRange,
    outputRange: [OVERFLOW_HEIGHT, 0, -OVERFLOW_HEIGHT],
  });
  return (
    <View style={styles.overflowContainer}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        {data.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <Text style={[styles.title]} numberOfLines={1}>{item.title}</Text>
            <View style={styles.itemContainerRow}>
              <Text style={[styles.location]}>
                <EvilIcons name="location" size={16} color="black" style={{ marginRight: 5 }} />
                {item.location}
              </Text>
              <Text style={[styles.date]}>{item.date}</Text>
            </View>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

export default function EventsPage() {
  const ref = React.useRef(null);
  const scrollXIndex = React.useRef(new Animated.Value(0)).current;
  const scrollXAnimated = React.useRef(new Animated.Value(0)).current;
  const [index, setIndex] = React.useState(0);
  const [selectedCategory, setSelectedCategory] = React.useState('animals');
  const setActiveIndex = React.useCallback((activeIndex) => {
    scrollXIndex.setValue(activeIndex);
    setIndex(activeIndex);
  });

  React.useEffect(() => {
    Animated.spring(scrollXAnimated, {
      toValue: scrollXIndex,
      useNativeDriver: true,
    }).start();
  }, [index]);

  React.useEffect(() => {
    if (index === DATA[selectedCategory].length - VISIBLE_ITEMS - 1) {
      const newData = [...DATA[selectedCategory], ...DATA[selectedCategory]];
      DATA[selectedCategory] = newData;
    }
  }, [index, selectedCategory]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FlingGestureHandler
        key="left"
        direction={Directions.LEFT}
        onHandlerStateChange={(ev) => {
          if (ev.nativeEvent.state === State.END) {
            if (index === DATA[selectedCategory].length - 1) {
              return;
            }
            setActiveIndex(index + 1);
          }
        }}
      >
        <FlingGestureHandler
          key="right"
          direction={Directions.RIGHT}
          onHandlerStateChange={(ev) => {
            if (ev.nativeEvent.state === State.END) {
              if (index === 0) {
                return;
              }
              setActiveIndex(index - 1);
            }
          }}
        >
          <SafeAreaView style={styles.container}>
            <StatusBar hidden />
            <OverflowItems data={DATA[selectedCategory]} scrollXAnimated={scrollXAnimated} />
            <FlatList
              ref={ref}
              data={DATA[selectedCategory]}
              keyExtractor={(_, index) => String(index)}
              horizontal
              inverted
              contentContainerStyle={{
                flex: 1,
                justifyContent: 'center',
                padding: SPACING * 2,
                marginTop: 50,
              }}
              scrollEnabled={false}
              removeClippedSubviews={false}
              CellRendererComponent={({ item, index, children, style, ...props }) => {
                const newStyle = [style, { zIndex: DATA[selectedCategory].length - index }];
                return (
                  <View style={newStyle} index={index} {...props}>
                    {children}
                  </View>
                );
              }}
              renderItem={({ item, index }) => {
                const inputRange = [index - 1, index, index + 1];
                const translateX = scrollXAnimated.interpolate({
                  inputRange,
                  outputRange: [50, 0, -100],
                });
                const scale = scrollXAnimated.interpolate({
                  inputRange,
                  outputRange: [0.8, 1, 1.3],
                });
                const opacity = scrollXAnimated.interpolate({
                  inputRange,
                  outputRange: [1 - 1 / VISIBLE_ITEMS, 1, 0],
                });

                return (
                  <Animated.View
                    style={{
                      position: 'absolute',
                      left: -ITEM_WIDTH / 2,
                      opacity,
                      transform: [
                        { translateX },
                        { scale },
                      ],
                    }}
                  >
                    <Image
                      source={{ uri: item.poster }}
                      style={{
                        width: ITEM_WIDTH,
                        height: ITEM_HEIGHT,
                        borderRadius: 14,
                      }}
                    />
                  </Animated.View>
                );
              }}
            />
            <FlatList
              ref={ref}
              initialScrollIndex={index}
              style={{ flexGrow: 0, backgroundColor: 'transparent', marginTop: 100 }} // Adjust this marginTop to move the white portion up or down
              data={Object.keys(DATA)}
              keyExtractor={(item) => item}
              contentContainerStyle={{ paddingLeft: _spacing }}
              showsHorizontalScrollIndicator={false}
              horizontal
              onScrollToIndexFailed={(info) => {
                const wait = new Promise((resolve) => setTimeout(resolve, 500));
                wait.then(() => {
                  ref.current?.scrollToIndex({ index: info.index, animated: true });
                });
              }}
              renderItem={({ item: category, index: fIndex }) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedCategory(category);
                      setIndex(0);
                    }}
                  >
                    <MotiView
                      animate={{
                        backgroundColor: fIndex === index ? _colors.active : _colors.inactive,
                        opacity: fIndex === index ? 1 : 0.6,
                      }}
                      transition={{
                        duration: 500,
                      }}
                      style={{
                        marginRight: _spacing,
                        padding: _spacing,
                        borderWidth: 2,
                        borderColor: _colors.active,
                        borderRadius: 12,
                        backgroundColor: 'transparent' // Making the background transparent
                      }}
                    >
                      <Text style={{ color: '#36303F', fontWeight: '700' }}>
                        {category}
                      </Text>
                    </MotiView>
                  </TouchableOpacity>
                );
              }}
            />
          </SafeAreaView>
        </FlingGestureHandler>
      </FlingGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  location: {
    fontSize: 16,
  },
  date: {
    fontSize: 12,
  },
  itemContainer: {
    height: OVERFLOW_HEIGHT,
    padding: SPACING * 2,
  },
  itemContainerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overflowContainer: {
    height: OVERFLOW_HEIGHT,
    overflow: 'hidden',
  },
});
