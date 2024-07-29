import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Image, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import Color from 'color';



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



const ITEM_HEIGHT = 85;
const MARGIN = 10;
const INACTIVE_TIME = 10000; // 10 seconds

const VolunteerScreen = () => {
  const navigation = useNavigation();
  const [activeSection, setActiveSection] = useState(null);
  const isExpanded = useSharedValue(false);
  const timer = useRef(null);

  const handleCardPress = (item) => {
    clearTimeout(timer.current);
    if (activeSection === item.title) {
      setActiveSection(null);
      isExpanded.value = false;
    } else {
      setActiveSection(item.title);
      isExpanded.value = true;
      timer.current = setTimeout(() => {
        setActiveSection(null);
        isExpanded.value = false;
      }, INACTIVE_TIME);
    }
  };

  const rMiniBarStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: withSpring(isExpanded.value ? -20 : 0) }],
      backgroundColor: 'black',
    };
  });

  const renderCard = (item, index) => {
    const rStyle = useAnimatedStyle(() => {
      return {
        height: withTiming(isExpanded.value && activeSection === item.title ? ITEM_HEIGHT + 250 : ITEM_HEIGHT, {
          duration: 1000,
        }),
        marginTop: MARGIN,
        marginBottom: MARGIN,
      };
    });

    return (
      <Animated.View key={index} style={[styles.card, rStyle]}>
        <TouchableOpacity onPress={() => handleCardPress(item)}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <MaterialIcons name="arrow-drop-down" size={25} color={'#D4D4D4'} />
          </View>
        </TouchableOpacity>
        {activeSection === item.title && (
          <View style={styles.dropdownContent}>
            <Image source={item.poster} style={styles.cardImage} />
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={() => navigation.navigate('DisplayScreen', { item })}
            >
              <Text style={styles.navigateButtonText}>Navigate</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    );
  };

  useEffect(() => {
    return () => clearTimeout(timer.current); // Cleanup timer on unmount
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, rMiniBarStyle]}>
        <Text style={styles.headerText}>Animal</Text>
      </Animated.View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {DATA.map((item, index) => renderCard(item, index))}
      </ScrollView>
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
    height: 85,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerText: {
    fontSize: RFPercentage(3),
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollViewContent: {
    paddingTop: 100,
    paddingBottom: 20,
  },
  card: {
    width: width * 0.9,
    backgroundColor: '#1B1B1B',
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  cardTitle: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  dropdownContent: {
    alignItems: 'center',
    padding: 15,
    paddingBottom: 15, // Adjusted padding to avoid bottom tab overlap
  },
  cardImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 15,
    marginBottom: 10,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff6e7',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  navigateButtonText: {
    color: '#000',
    fontSize: 18,
  },
});