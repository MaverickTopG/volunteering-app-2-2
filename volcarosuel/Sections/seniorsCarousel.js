import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, SafeAreaView, Animated, FlatList, Image, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');
const LibraryImage = require('../../assets/library.png');

const DATA = [
  {
    title: 'The Book Exchange',
    location: 'Not specified',
    date: '1998',
    poster: LibraryImage,
    description: 'The Book Exchange offers a platform for exchanging used books to promote reading and literacy. Volunteers can help organize books, manage exchanges, and assist with community outreach efforts to encourage book donations and literacy programs.',
    address: 'Not Specified',
    email: 'global.k12books@gmail.com',
  },
  {
    title: 'Belvedere Tiburon Library',
    location: 'Tiburon, CA',
    date: '1997',
    poster: LibraryImage,
    description: 'The Belvedere Tiburon Library regularly seeks volunteers to assist with various functions such as assembling annual mailings, working in Corner Books, and helping with annual events. Teen volunteers can also participate in community service activities, such as the Reading Buddies program, where they read to younger children and help foster a love of reading.',
    address: '1501 Tiburon Blvd, Tiburon, CA 94920',
    email: '415-789-2665',
  },
  {
    title: 'Corte Madera Library',
    location: 'Corte Madera, CA',
    date: '1966',
    poster: LibraryImage,
    description: 'Corte Madera Library offers volunteer opportunities for teens to help with library activities and events. Volunteers can assist with summer reading programs, help organize library materials, and support various community outreach initiatives.',
    address: '707 Meadowsweet Dr, Corte Madera, CA 94925',
    email: '415-924-3515',
  },
  {
    title: 'Larkspur Library',
    location: 'Larkspur, CA',
    date: '1913',
    poster: LibraryImage,
    description: 'Larkspur Library welcomes teen volunteers to assist with a range of activities including event planning, organizing books, and helping with childrens programs. Volunteers play a vital role in supporting the library’s mission to serve the community.',
    address: '400 Magnolia Ave, Larkspur, CA 94939',
    email: '415-927-5022',
  },
  {
    title: 'Marin City/Sausalito Library',
    location: 'Marin City, CA',
    date: '1975',
    poster: LibraryImage,
    description: 'Marin City/Sausalito Library offers volunteer opportunities for teens to engage in community service by assisting with library programs, helping patrons, and supporting library events. Volunteers can contribute to making the library a vibrant community hub.',
    address: '164 Donahue St, Marin City, CA 94965',
    email: '415-332-6158',
  },
  {
    title: 'Marin County Public Library',
    location: 'San Rafael, CA',
    date: '1927',
    poster: LibraryImage,
    description: 'Marin County Public Library provides a variety of volunteer opportunities for teens across its branches. Volunteers can help with children’s storytimes, summer reading programs, organizing books, and special events. This is a great way to gain experience and give back to the community.',
    address: '3501 Civic Center Dr, Suite 414, San Rafael, CA 94903',
    email: '415-473-3220',
  },
];

const ITEM_WIDTH = width * 0.76;
const ITEM_HEIGHT = ITEM_WIDTH * 1.5;

const SeniorCarousel = () => {
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
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                {item.title}
              </Text>
              <View style={styles.infoContainer}>
                <Text style={styles.location}>{item.location}</Text>
                <Text style={styles.date}>{item.date}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('DisplayScreen', { item })}
              style={styles.imageContainer}
            >
              <Image source={item.poster} style={styles.posterImage} />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default SeniorCarousel;

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
    width: ITEM_WIDTH + 100,
    height: ITEM_HEIGHT + 170,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 90,
    left:13,
  },
  posterImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'cover',
  },
  textContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'black',
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
