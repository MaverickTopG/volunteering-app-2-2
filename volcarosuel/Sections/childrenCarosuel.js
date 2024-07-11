import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, SafeAreaView, Animated, FlatList, Image, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

const DATA = [
  {
    title: 'Afro vibes',
    location: 'Mumbai, India',
    date: 'Nov 17th, 2020',
    poster: 'https://www.creative-flyers.com/wp-content/uploads/2020/07/Afro-vibes-flyer-template.jpg',
    description: 'An exciting Afro vibes event.',
    address: '120 lower via casitas',
    email: 'contact@afrovibes.com',
  },
  {
    title: 'Jungle Party',
    location: 'Unknown',
    date: 'Sept 3rd, 2020',
    poster: 'https://www.creative-flyers.com/wp-content/uploads/2019/11/Jungle-Party-Flyer-Template-1.jpg',
    description: 'A thrilling jungle party.',
    address: '120 lower via casitas',
    email: 'contact@jungleparty.com',
  },
];

const ITEM_WIDTH = width * 0.76;
const ITEM_HEIGHT = ITEM_WIDTH * 1.5;

const ChildrenCarousel = () => {
  const navigation = useNavigation();
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      <Animated.FlatList
        data={DATA}
        keyExtractor={(item) => item.title}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * ITEM_WIDTH,
            index * ITEM_WIDTH,
            (index + 1) * ITEM_WIDTH,
          ];

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.6, 1, 0.6],
            extrapolate: 'clamp',
          });

          return (
            <View style={styles.itemContainer}>
              <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <View style={styles.infoContainer}>
                  <Text style={styles.location}>{item.location}</Text>
                  <Text style={styles.date}>{item.date}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('DisplayScreen', { item })}
                style={styles.imageContainer}
              >
                <Image source={{ uri: item.poster }} style={styles.posterImage} />
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

export default ChildrenCarousel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7',
  },
  itemContainer: {
    width: width,
    alignItems: 'center',
  },
  imageContainer: {
    width: ITEM_WIDTH + 20 ,
    height: ITEM_HEIGHT + 50,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 130, // Adjust to move the poster down
  },
  posterImage: {
    height: '100%',
    resizeMode: 'cover',
  },
  textContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100, // Increase height of the mini bar
    backgroundColor: 'black', // Ensure the mini bar background is black
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: RFPercentage(3.5),
    fontWeight: '900',
    color: '#fff',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  location: {
    fontSize: RFPercentage(2),
    color: '#fff',
  },
  date: {
    fontSize: RFPercentage(2),
    color: '#fff',
  },
});
