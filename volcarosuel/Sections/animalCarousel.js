import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Image, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';




const { width, height } = Dimensions.get('window');

const DATA = [
  {
    title: 'Hooves for Harmony',
    location: 'Redding, CA',
    date: '2015',
    poster: require('../../assets/Hooves for Harmony.jpeg'), // Use require for local images
    description: 'Hooves for Harmony provides equine therapy to individuals of all ages with a focus on mental health and emotional well-being. The organization uses the therapeutic power of horses to help clients develop trust, self-esteem, and emotional regulation. Volunteers at Hooves for Harmony assist in therapy sessions, help with workshops, manage community outreach initiatives, and care for the horses. This is a wonderful opportunity for teens interested in mental health and animal therapy, allowing them to make a significant impact on the lives of clients and the well-being of the horses.',
    address: 'Morning Star Farm, Novato, CA 94948',
    email: '530-410-4422 or heatherparker1111@gmail.com',
    website:'https://www.hoovesforharmony.org/volunteer',
    
  },
  {
    title: 'WILDCARE',
    location: 'San Rafael, CA',
    date: '1994',
    poster: require('../../assets/wildcare.png'), // Use require for local images
    description: ' WILDCARE is a wildlife rehabilitation and nature education center that serves the San Francisco Bay Area. They provide medical care and rehabilitation for injured, orphaned, and ill wildlife with the goal of releasing them back into their natural habitats. Volunteers at WILDCARE assist with animal care, support environmental education programs, help with community outreach, and participate in habitat restoration projects. This is an excellent opportunity for teens interested in wildlife conservation and wanting to contribute to the care and rehabilitation of local wildlife.',
    address: '220 S Garrard Blvd, Point Richmond, CA 94801',
    email: '415-456-7283',
    website:'https://discoverwildcare.org/volunteer/',
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
      backgroundColor: '#fff6e7',
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
          <View style={[styles.dropdownContent, { height: ITEM_HEIGHT + 150 }]}>
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
    height: 100,
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
  scrollViewContent: {
    paddingTop: 120, // Keep cards lower on the screen
    paddingBottom: 20,
  },
  card: {
    width: width * 0.9,
    backgroundColor: '#fff6e7',
    borderRadius: 15,
    overflow: 'hidden',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#333333',
    marginVertical: 15,
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
    color: '#333333',
  },
  dropdownContent: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  cardImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    borderRadius: 10,
    marginBottom: 10,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff6e7',
    paddingVertical: 15, // Align with dropdown button height
    paddingHorizontal: 15,
    borderRadius: 10,
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10, // Ensure consistent spacing from the image
  },
  navigateButtonText: {
    color: '#333333',
    fontSize: 18,
  },
  siteButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff6e7',
    paddingVertical: 15, // Same height as the Navigate button
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 10, // Add spacing to separate from the next element
  },
  siteButtonText: {
    fontSize: 16,
    color: '#333333',
  },
});
