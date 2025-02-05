import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  SafeAreaView,
  SectionList,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { MaterialIcons } from '@expo/vector-icons';
import { TapGestureHandler } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    title: 'Giants Steps Therapeutic Equestrian Center',
    location: 'Petaluma, CA',
    address: '7600 Lakeville Highway, Sonoma Horse Park, Petaluma, CA 94954',
    county: 'Sonoma County',
    website: 'http://www.giantstepsriding.org/volunteer',
    email: '707-781-9455',
    description: 'Volunteers at Giant Steps do more than give their time and energy.hey make lifelong friends and join a larger community of fun-loving, energetic, individuals intent on making a difference. Volunteers assist riders during their weekly lessons, groom horses, help maintain the facility, assist with administrative tasks, and much, much more.'
  },
  {
    title: 'Halleck Creek Ranch',
    location: 'Nicasio, CA',
    address: '1740 Old Rancheria Road, Nicasio, CA 94946',
    county: 'Marin County',
    website: 'https://halleckcreekranch.org/volunteer/',
    email: '415-662-2488',
    description: 'Halleck Creek Ranch provides adaptive riding and equine-assisted programs in a nurturing setting, helping individuals with disabilities build confidence and skills.'
  },
  {
    title: 'Marine Mammal Center',
    location: 'Sausalito, CA',
    address: '2000 Bunker Road, Fort Cronkhite, Sausalito, CA 94965-2619',
    county: 'Marin County',
    website: 'http://www.marinemammalcenter.org/get-involved/volunteer/',
    email: '415-289-0216',
    description: 'The Marine Mammal Center rescues, rehabilitates, and releases marine mammals while advancing ocean health through research and public education.'
  },
  {
    title: 'Milo Foundation',
    location: 'Point Richmond, CA',
    address: '220 S Garrard Blvd, Point Richmond, CA 94801',
    county: 'Contra Costa County',
    website: 'https://www.milofoundation.org/volunteer-program/',
    email: '510-900-2275',
    description: 'The Milo Foundation is a no-kill organization dedicated to rescuing homeless pets, offering sanctuary care and volunteer opportunities to help find these animals forever homes.'
  },
  {
    title: 'Save A Bunny',
    location: 'Mill Valley, CA',
    address: 'Not Specified',  
    county: 'Marin County',
    website: 'https://saveabunny.org/adopt-help/volunteer-with-saveabunny/',
    email: '415-388-2790',
    description: 'Save A Bunny is a volunteer-driven nonprofit that rescues and rehomes domestic rabbits, while educating the community on proper rabbit care.'
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

const VolunteerScreen = ({ route }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const listRef = useRef(null);
  const searchBarTimer = useRef(null);

  // Retrieve data passed from Search Screen (if any)
  const { searchScreenData } = route.params || {};

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
    navigation.navigate('SearchScreen', { data: searchScreenData });
  };

  // Static mini header style (no animation)
  const headerStyle = {
    backgroundColor: '#fff6e7',
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  // Each card is rendered as a simple button with the item title.
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('DisplayScreen', { item })}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    if (searchVisible) {
      searchBarTimer.current = setTimeout(() => {
        setSearchVisible(false);
        setSearchQuery('');
      }, 10000);
    }
    return () => clearTimeout(searchBarTimer.current);
  }, [searchVisible]);

  return (
    <TapGestureHandler numberOfTaps={2} onActivated={() => setSearchVisible(!searchVisible)}>
      <SafeAreaView style={styles.container}>
        {/* Back Button: using safe-area inset to ensure it’s not covered */}
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 10 }]}
          onPress={handleBackPress}
        >
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

        <View style={[styles.header, headerStyle]}>
          <Text style={styles.headerText}>Animal</Text>
        </View>
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
  // Back button now uses insets so it won’t be hidden.
  backButton: {
    marginTop: -45,
    position: 'absolute',
    left: 10,
    padding: 10,
    zIndex: 100,

  },
  headerText: {
    fontSize: RFPercentage(3),
    fontWeight: 'bold',
    color: '#333333',
  },
  scrollViewContent: {
    paddingTop: 120,
    paddingBottom: 90,
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
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    marginVertical: 15,
    padding: 15,
  },
  cardTitle: {
    fontSize: RFPercentage(2),
    color: '#333333',
    textAlign: 'center',
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
    zIndex: 200,
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
