import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  SectionList,
  TextInput,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { TapGestureHandler } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

// Data with counties added
const DATA = [

  {
    title: 'WILDCARE',
    location: 'San Rafael, CA',
    date: '1994',
    poster: require('../../assets/wildcare.png'),
    description:
      'WILDCARE is a wildlife rehabilitation and nature education center that serves the San Francisco Bay Area. They provide medical care and rehabilitation for injured, orphaned, and ill wildlife with the goal of releasing them back into their natural habitats. Volunteers at WILDCARE assist with animal care, support environmental education programs, help with community outreach, and participate in habitat restoration projects.',
    address: '220 S Garrard Blvd, Point Richmond, CA 94801',
    email: '415-456-7283',
    website: 'https://discoverwildcare.org/volunteer/',
    county: 'Marin County',
  },
  {
    title: 'Hooves for Harmony',
    location: 'Redding, CA',
    date: '2015',
    poster: require('../../assets/Hooves for Harmony.jpeg'),
    description:
      'Hooves for Harmony provides equine therapy to individuals of all ages with a focus on mental health and emotional well-being. The organization uses the therapeutic power of horses to help clients develop trust, self-esteem, and emotional regulation. Volunteers at Hooves for Harmony assist in therapy sessions, help with workshops, manage community outreach initiatives, and care for the horses.',
    address: 'Morning Star Farm, Novato, CA 94948',
    email: '530-410-4422 or heatherparker1111@gmail.com',
    website: 'https://www.hoovesforharmony.org/volunteer',
    county: 'Marin County',
  },
  {
    title: 'The Little Red Dog',
    location: 'Laguna Hills, CA',
    date: '2011',
    poster: require('../../assets/little dog.jpg'),
    description:
      'The Little Red Dog is a non-profit organization based in Orange County, California, dedicated to rescuing, rehabilitating, and rehoming dogs from high-kill shelters. Their mission is to eliminate euthanasia and end animal cruelty by educating the community on dog behavior and responsible pet ownership. The organization helps dogs of all breeds and sizes, focusing on saving those that are often overlooked due to age, medical conditions, or behavioral issues.',
    address: '23046 Avenida de la Carlota Suite 600, Laguna Hills, CA 92653',
    email: '949-427-0925 or info@thelittlereddog.org',
    website: 'https://thelittlereddog.org/volunteer-form',
    county: 'Orange County',
  },
  {
    title: 'Hanaeleh Horse Rescue',
    location: 'Trabuco Canyon, CA',
    date: '2004',
    poster: require('../../assets/horsey.png'),
    description:
      'Volunteering at Hanaeleh Horse Rescue offers a unique opportunity to support the care and rehabilitation of rescued horses. Volunteers assist with feeding, grooming, cleaning stalls, and maintaining the facility. They also help with fundraising, outreach, and administrative tasks. No prior horse experience is required—just a willingness to learn and a passion for animal welfare. Volunteers play a vital role in ensuring the safety and well-being of the horses while supporting Hanaeleh’s mission.',
    address: 'Trabuco Canyon, Orange County, California',
    email: 'info@hanaeleh.org or 949-842-7408',
    website: 'https://www.hanaeleh.org/thank-you-for-inquiring-about-becoming-a-hanaeleh-volunteer/',
    county: 'Orange County',
  },


];


// Group data by county
const groupByCounty = (data) => {
  const counties = {};
  data.forEach((item) => {
    if (!counties[item.county]) {
      counties[item.county] = [];
    }
    counties[item.county].push(item);
  });
  return Object.keys(counties).map((county) => ({
    title: county,
    data: counties[county],
  }));
};

const SECTIONS = groupByCounty(DATA);

const ITEM_HEIGHT = 85;
const MARGIN = 10;
const INACTIVE_TIME = 10000; // 10 seconds

const VolunteerScreen = ({ route }) => {
  const navigation = useNavigation();
  const [activeSection, setActiveSection] = useState(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isExpanded = useSharedValue(false);
  const timer = useRef(null);
  const listRef = useRef(null);
  const searchBarTimer = useRef(null);

  // Retrieve data passed from Search Screen (if any)
  const { searchScreenData } = route.params || {};

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

  const handleSearch = (query) => {
    setSearchQuery(query);
    const sectionIndex = SECTIONS.findIndex((section) =>
      section.title.toLowerCase().includes(query.toLowerCase())
    );
    if (sectionIndex >= 0 && listRef.current) {
      listRef.current.scrollToLocation({
        sectionIndex,
        itemIndex: 0,
        viewOffset: 100,
      });
    }
  };

  const handleBackPress = () => {
    navigation.navigate('SearchScreen', { data: searchScreenData }); // Navigate explicitly to Search Screen
  };

  const rMiniBarStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: withSpring(isExpanded.value ? -20 : 0) }],
      backgroundColor: '#fff6e7',
    };
  });

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const renderItem = ({ item }) => {
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
      <Animated.View key={item.title} style={[styles.card, rStyle]}>
        <TouchableOpacity onPress={() => handleCardPress(item)}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <MaterialIcons
              name={isExpanded.value && activeSection === item.title ? 'arrow-drop-up' : 'arrow-drop-down'}
              size={25}
              color={'#D4D4D4'}
            />
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
    if (searchVisible) {
      searchBarTimer.current = setTimeout(() => {
        setSearchVisible(false);
        setSearchQuery('');
      }, INACTIVE_TIME);
    }
    return () => clearTimeout(searchBarTimer.current); // Cleanup timer
  }, [searchVisible]);

  return (
    <TapGestureHandler numberOfTaps={2} onActivated={() => setSearchVisible(!searchVisible)}>
      <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
  <MaterialIcons name="arrow-back" size={24} color="#333" />
</TouchableOpacity>

        {searchVisible && (
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              placeholder="Search by county..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={handleSearch}
              style={styles.searchInput}
            />
          </View>
        )}
        <Animated.View style={[styles.header, rMiniBarStyle]}>
          <Text style={styles.headerText}>Animal</Text>
        </Animated.View>
        <SectionList
          ref={listRef}
          sections={SECTIONS}
          keyExtractor={(item, index) => item.title + index}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          contentContainerStyle={styles.scrollViewContent}
          stickySectionHeadersEnabled
        />
      </SafeAreaView>
    </TapGestureHandler>
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
  backButton: {
    position: 'absolute',
    top: -10,
    left: 5, 
    padding: 10, 
    zIndex: 3, 
  },
  
  headerText: {
    fontSize: RFPercentage(3),
    fontWeight: 'bold',
    color: '#333333',
  },
  scrollViewContent: {
    paddingTop: 120,
    paddingBottom: 20,
  },
  sectionHeader: {
    backgroundColor: '#fff6e7',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sectionHeaderText: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    color: '#333333',
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
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  navigateButtonText: {
    color: '#333333',
    fontSize: 18,
  },
  searchBar: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    height: 50,
    backgroundColor: '#fff6e7',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    zIndex: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
});
