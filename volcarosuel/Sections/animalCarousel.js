import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, SafeAreaView, Animated, FlatList, Image, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

const DATA = [
  {
    title: 'Giants Steps Therapeutic Equestrian Center',
    location: 'Petaluma, CA',
    date: '1998',
    poster: require('../../assets/animals.png'), // Use require for local images
    description: 'Giants Steps Therapeutic Equestrian Center provides equine-assisted activities and therapies to children and adults with disabilities. Their mission is to enrich the lives of individuals with physical, cognitive, emotional, and developmental challenges through equine-assisted activities and therapies. Volunteers at Giants Steps play a crucial role in various tasks, such as assisting with therapeutic riding sessions, grooming and caring for horses, maintaining the facility, and supporting administrative tasks. This opportunity is perfect for teens who love horses and want to impact the lives of individuals with disabilities positively.',
    address: '7600 Lakeville Highway, Petaluma, CA 94954',
    email: '707-781-9455',
  },
  {
    title: 'Halleck Creek Ranch',
    location: 'Nicasio, CA',
    date: '1977',
    poster: require('../../assets/animals.png'), // Use require for local images
    description: 'Halleck Creek Ranch offers therapeutic horseback riding to people with disabilities in Marin and Sonoma counties. Their goal is to improve the quality of life for individuals with disabilities by offering year-round therapeutic riding and horsemanship programs. Volunteers at Halleck Creek Ranch assist with horse care, help during riding sessions, support the upkeep of the facility and engage with participants to build their confidence and social skills. Volunteers are essential to the smooth operation of the ranch and the success of its programs.',
    address: '1740 Old Rancheria Road, Nicasio, CA 94946',
    email: '415-662-2488',
  },
  {
    title: 'Hooves for Harmony',
    location: 'Redding, CA',
    date: '2015',
    poster: require('../../assets/animals.png'), // Use require for local images
    description: 'Hooves for Harmony provides equine therapy to individuals of all ages with a focus on mental health and emotional well-being. The organization uses the therapeutic power of horses to help clients develop trust, self-esteem, and emotional regulation. Volunteers at Hooves for Harmony assist in therapy sessions, help with workshops, manage community outreach initiatives, and care for the horses. This is a wonderful opportunity for teens interested in mental health and animal therapy, allowing them to make a significant impact on the lives of clients and the well-being of the horses.',
    address: 'Morning Star Farm, Novato, CA 94948',
    email: '530-410-4422',
  },
  {
    title: 'Marine Mammal Center',
    location: 'Sausalito, CA',
    date: '1975',
    poster: require('../../assets/animals.png'), // Use require for local images
    description: 'The Marine Mammal Center is dedicated to the rescue, rehabilitation, and release of injured and sick marine mammals. They also conduct research on marine mammal health and provide education to the public about marine mammal conservation. Volunteers at the Marine Mammal Center can participate in animal care, educational outreach, facility maintenance, and research projects. This includes tasks such as feeding and caring for the animals, assisting in the animal hospital, conducting public tours, and helping with data collection for research. This is an excellent opportunity for teens interested in marine biology, veterinary science, and environmental conservation.',
    address: '2000 Bunker Road, Fort Cronkhite, Sausalito, CA 94965-2619',
    email: '415-289-0216',
  },
  {
    title: 'Milo Foundation',
    location: 'Point Richmond, CA',
    date: '1994',
    poster: require('../../assets/animals.png'), // Use require for local images
    description: 'The Milo Foundation is a non-profit organization that rescues animals from high-kill shelters and finds them permanent homes. They offer sanctuary and adoption services for dogs and cats, and operate a sanctuary in Mendocino County. Volunteers at the Milo Foundation assist with daily care of the animals, support adoption events, participate in community outreach and education programs, and help with administrative tasks. This opportunity is ideal for teens who love animals and want to contribute to their welfare and find them loving homes.',
    address: '220 S Garrard Blvd, Point Richmond, CA 94801',
    email: '510-900-2275',
  },
  {
    title: 'Save A Bunny',
    location: 'Mill Valley, CA',
    date: '1999',
    poster: require('../../assets/animals.png'), // Use require for local images
    description: 'Save A Bunny is a rabbit rescue and adoption organization dedicated to the welfare of domestic rabbits. They provide rescue, rehabilitation, and adoption services for abandoned and neglected rabbits, and work to educate the public about rabbit care. Volunteers at Save A Bunny can assist with rabbit care, support rehabilitation and adoption efforts, help with educational programs, and participate in community outreach. This is a great opportunity for teens who are passionate about animal welfare and want to make a difference in the lives of rabbits.',
    address: '514 Pineo Ave, Mill Valley, CA 94941',
    email: '415-388-2790',
  },
  {
    title: 'WILDCARE',
    location: 'San Rafael, CA',
    date: '1994',
    poster: require('../../assets/animals.png'), // Use require for local images
    description: ' WILDCARE is a wildlife rehabilitation and nature education center that serves the San Francisco Bay Area. They provide medical care and rehabilitation for injured, orphaned, and ill wildlife with the goal of releasing them back into their natural habitats. Volunteers at WILDCARE assist with animal care, support environmental education programs, help with community outreach, and participate in habitat restoration projects. This is an excellent opportunity for teens interested in wildlife conservation and wanting to contribute to the care and rehabilitation of local wildlife.',
    address: '220 S Garrard Blvd, Point Richmond, CA 94801',
    email: '415-456-7283',
  },
];

const ITEM_WIDTH = width * 0.76;
const ITEM_HEIGHT = ITEM_WIDTH * 1.5;

const AnimalCarousel = () => {
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

export default AnimalCarousel;

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
    width: ITEM_WIDTH + 20,
    height: ITEM_HEIGHT + 50,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 130,
  },
  posterImage: {
    width: '100%',
    height: '100%',
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
