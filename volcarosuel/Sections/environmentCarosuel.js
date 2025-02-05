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
import { MaterialIcons } from '@expo/vector-icons';
import { TapGestureHandler } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const { width } = Dimensions.get('window');

// Data with counties added
const DATA = [

  {
    title: 'Marin County Parks & Landscape',
    location: 'San Rafael, CA',
    date: '1972',
    poster: require('../../assets/download.png'),
    description: 'Marin County Parks offers volunteer opportunities for teens to participate in landscape maintenance, habitat restoration, and park beautification projects. Volunteers help keep parks clean, safe, and inviting for all visitors while supporting environmental conservation efforts.',
    address: '3501 Civic Center Drive, Suite 260, San Rafael, CA 94903',
    email: '415-473-2823',
    website: 'https://www.parks.marincounty.org/discoverlearn/volunteer',
    county: 'Marin County',
  },
  {
    title: 'Mill Valley Public Works',
    location: 'Mill Valley, CA',
    date: '1900',
    poster: require('../../assets/millvalley.png'),
    description: ' Mill Valley Public Works provides volunteer opportunities for teens to assist with various public works projects, including park maintenance, street clean-ups, and infrastructure improvements. Volunteers help enhance the city’s public spaces and contribute to community well-being.',
    address: '26 Corte Madera Avenue, Mill Valley, CA 94941',
    email: '415-384-4800',
    website: 'https://www.cityofmillvalley.org/725/Volunteering',
    county: 'Marin County',

  },
  {
    title: 'Slide Ranch',
    location: 'Muir Beach, CA',
    date: '1970',
    poster: require('../../assets/slide ranch.png'),
    description: ' Slide Ranch offers volunteer opportunities for teens to assist with sustainable farming, environmental education, and habitat restoration. Volunteers help with farm chores, maintain trails, and support educational programs that connect people to nature and sustainable agriculture.',
    address: '2025 Shoreline Highway, Muir Beach, CA 94965',
    email: '415-381-6155',
    website: 'https://www.slideranch.org/volunteer',
    county: 'Marin County',

  },
  {
    title: 'Audubon Center',
    location: 'Mill Valley, CA',
    date: 'N/A',
    // Omit poster if you do not have an image; otherwise add a poster field
    description:
      'The Audubon Center offers environmental education programs and volunteer opportunities focused on conservation, habitat restoration, and community engagement. Volunteers support initiatives that protect local wildlife and natural resources.',
    address: '376 Greenwood Beach Road, Tiburon, CA 94920',
    email: '415-388-2524', // Contact phone number
    website: 'https://www.audubonmarin.org/volunteer',
    county: 'Marin County',
  },
  {
    title: 'Golden Gate National Parks Conservancy',
    location: 'San Francisco, CA',
    date: 'N/A',
    description:
      'The Golden Gate National Parks Conservancy mobilizes volunteers for environmental stewardship projects around the Golden Gate National Parks, including habitat restoration and community events.',
    address: 'Building 201, Fort Mason, San Francisco, CA 94123',
    email: '415-561-3044',
    website: 'https://www.ggnpconservancy.org/volunteer',
    county: 'Marin County',
  },
  {
    title: 'Habitat for Humanity - Park/Community Beautification',
    location: 'San Rafael, CA',
    date: 'N/A',
    description:
      'This Habitat for Humanity initiative focuses on park and community beautification projects, engaging volunteers in landscaping, maintenance, and restoration to improve public spaces.',
    address: '300 Montgomery Street, Suite 450, San Francisco, CA 94104',
    email: '415-625-1000',
    website: 'https://www.habitat.org/volunteer',
    county: 'Marin County',
  },
  {
    title: 'Marin County Open Space',
    location: 'San Rafael, CA',
    date: 'N/A',
    description:
      'Marin County Open Space promotes the conservation of natural landscapes through volunteer-driven initiatives including trail maintenance, invasive species removal, and public education on sustainable practices.',
    address: '3501 Civic Center Drive, Suite 260, San Rafael, CA 94903',
    email: '415-473-3778',
    website: 'https://parks.marincounty.gov/discoverlearn/volunteer',
    county: 'Marin County',
  },
  {
    title: 'Marin Agricultural Land Trust',
    location: 'San Rafael, CA',
    date: 'N/A',
    description:
      'Marin Agricultural Land Trust works to protect and preserve agricultural land in Marin County. Volunteers help with outreach, land stewardship, and community engagement to support local farming and sustainable agriculture.',
    address: 'P.O. Box 850, Point Reyes Station, CA 94956',
    email: '415-663-1158',
    website: 'https://malt.org/volunteer/',
    county: 'Marin County',
  },
  {
    title: 'Marin Headlands Native Plants Nursery',
    location: 'Sausalito, CA',
    date: 'N/A',
    description:
      'The Marin Headlands Native Plants Nursery offers opportunities for volunteers to support the cultivation and distribution of native plant species, contributing to habitat restoration and environmental education.',
    address: '1301 Kirkpatrick Street, Fort Cronkite, Sausalito, CA 94965',
    email: '415-332-5193',
    website: 'https://www.nps.gov/places/000/marin-headlands-native-plant-nursery.htm',
    county: 'Marin County',
  },
  {
    title: 'Muir Woods',
    location: 'Mill Valley, CA',
    date: 'N/A',
    description:
      'Muir Woods National Monument offers volunteer opportunities to help maintain trails, support conservation efforts, and enhance visitor experiences in this iconic redwood forest.',
    address: '1 Muir Woods Road, Mill Valley, CA 94941',
    email: '415-561-4755',
    website: 'https://www.nps.gov/muwo/getinvolved/volunteer.htm',
    county: 'Marin County',
  },
  {
    title: 'Mt. Tam Watershed',
    location: 'Mill Valley, CA',
    date: 'N/A',
    description:
      'Mt. Tam Watershed invites volunteers to participate in conservation and restoration projects focused on preserving water quality and natural resources in the Mt. Tam area.',
    address: '220 Nellen Avenue, Corte Madera, CA 94925',
    email: '415-945-1128',
    website: 'https://www.marinwater.org/volunteer',
    county: 'Marin County',
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
          <Text style={styles.headerText}>Environment</Text>
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
    marginTop:-45,
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
